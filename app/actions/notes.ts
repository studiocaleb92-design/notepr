"use server";

import { createClient } from "@/app/lib/supabase/server";
import { formatSupabaseClientError } from "@/app/lib/supabase/fetch-retry";

/** When `note_folders` / `notes.folder_id` migration has not been applied yet */
function isFoldersMigrationMissing(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  const m = error.message.toLowerCase();
  return (
    m.includes("note_folders") ||
    m.includes("folder_id") ||
    (m.includes("schema cache") && (m.includes("folder") || m.includes("note_folders")))
  );
}

export type NoteFolder = {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  links: { url: string; label: string }[];
  folder_id?: string | null;
  created_at: string;
  updated_at: string;
  note_attachments?: NoteAttachment[];
};

export type NoteAttachment = {
  id: string;
  note_id: string;
  type: "image" | "audio";
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  created_at: string;
};

export async function getFolders(): Promise<NoteFolder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_folders")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isFoldersMigrationMissing(error)) return [];
    throw new Error(formatSupabaseClientError(error));
  }
  return (data ?? []) as NoteFolder[];
}

export async function createFolder(name: string): Promise<NoteFolder> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = name.trim() || "New folder";
  const { count } = await supabase
    .from("note_folders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data, error } = await supabase
    .from("note_folders")
    .insert({
      user_id: user.id,
      name: trimmed,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(formatSupabaseClientError(error));
  return data as NoteFolder;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("note_folders")
    .update({ name: name.trim() || "Untitled folder" })
    .eq("id", id);
  if (error) throw new Error(formatSupabaseClientError(error));
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("note_folders").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseClientError(error));
}

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*, note_attachments(*)")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(formatSupabaseClientError(error));
  return (data ?? []) as Note[];
}

export async function createNote(folderId?: string | null): Promise<Note> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const withFolder = {
    user_id: user.id,
    title: "Untitled",
    content: "",
    links: [] as [],
    folder_id: folderId ?? null,
  };
  const withoutFolder = {
    user_id: user.id,
    title: "Untitled",
    content: "",
    links: [] as [],
  };

  let { data, error } = await supabase.from("notes").insert(withFolder).select().single();

  if (error && isFoldersMigrationMissing(error)) {
    ({ data, error } = await supabase.from("notes").insert(withoutFolder).select().single());
  }

  if (error) throw new Error(formatSupabaseClientError(error));
  return data as Note;
}

export async function updateNote(
  id: string,
  fields: {
    title?: string;
    content?: string;
    links?: { url: string; label: string }[];
    folder_id?: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  let { error } = await supabase.from("notes").update(fields).eq("id", id);

  if (error && fields.folder_id !== undefined && isFoldersMigrationMissing(error)) {
    const rest = { ...fields };
    delete rest.folder_id;
    if (Object.keys(rest).length > 0) {
      ({ error } = await supabase.from("notes").update(rest).eq("id", id));
    } else {
      error = null;
    }
  }

  if (error) throw new Error(formatSupabaseClientError(error));
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();

  // Delete storage files for this note's attachments first
  const { data: attachments } = await supabase
    .from("note_attachments")
    .select("storage_path")
    .eq("note_id", id);

  if (attachments && attachments.length > 0) {
    const paths = attachments.map((a) => a.storage_path);
    await supabase.storage.from("note-attachments").remove(paths);
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseClientError(error));
}

export async function addAttachment(formData: FormData): Promise<NoteAttachment> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const noteId = formData.get("note_id") as string;
  const file = formData.get("file") as File;
  const type = file.type.startsWith("image/") ? "image" : "audio";

  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${user.id}/${noteId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("note-attachments")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw new Error(formatSupabaseClientError(uploadError));

  const { data, error } = await supabase
    .from("note_attachments")
    .insert({
      note_id: noteId,
      user_id: user.id,
      type,
      filename: file.name,
      storage_path: storagePath,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("note-attachments").remove([storagePath]);
    throw new Error(formatSupabaseClientError(error));
  }

  return data as NoteAttachment;
}

export async function deleteAttachment(attachmentId: string, storagePath: string): Promise<void> {
  const supabase = await createClient();

  await supabase.storage.from("note-attachments").remove([storagePath]);

  const { error } = await supabase
    .from("note_attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) throw new Error(formatSupabaseClientError(error));
}

export async function getAttachmentUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("note-attachments")
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl ?? "";
}
