import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getFolders, getNotes } from "@/app/actions/notes";
import NotesShell from "./components/NotesShell";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Avatar for sidebar
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  let avatarUrl: string | null = null;
  if (profile?.avatar_url) {
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_url, 3600);
    avatarUrl = data?.signedUrl ?? null;
  }

  const [notes, folders] = await Promise.all([getNotes(), getFolders()]);

  return (
    <NotesShell
      initialNotes={notes}
      initialFolders={folders}
      user={user}
      avatarUrl={avatarUrl}
    />
  );
}
