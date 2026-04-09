"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // When "Confirm email" is enabled in Supabase, session is null until the user verifies
  if (!data.session) {
    return redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      return redirect(`/login?pending_verification=${encodeURIComponent(email)}`);
    }
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/dashboard");
}

export async function resendSignupConfirmation(
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const trimmed = email?.trim() ?? "";
  if (!trimmed) {
    return { ok: false, message: "Enter your email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmed,
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, message: "Confirmation email sent. Check your inbox and spam folder." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/avatar.${ext}`;

  // Remove any existing avatar files for this user
  const { data: existing } = await supabase.storage
    .from("avatars")
    .list(user.id);
  if (existing && existing.length > 0) {
    const paths = existing.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from("avatars").remove(paths);
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, { contentType: file.type, upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  // Persist path to profiles table
  await supabase
    .from("profiles")
    .update({ avatar_url: storagePath })
    .eq("id", user.id);

  // Sync into auth user metadata so sidebar/header can read it
  await supabase.auth.updateUser({ data: { avatar_url: storagePath } });

  revalidatePath("/dashboard/settings");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Remove all avatar files
  const { data: avatarFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);
  if (avatarFiles && avatarFiles.length > 0) {
    const paths = avatarFiles.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from("avatars").remove(paths);
  }

  // Remove all note attachment files
  const { data: noteFiles } = await supabase.storage
    .from("note-attachments")
    .list(user.id);
  if (noteFiles && noteFiles.length > 0) {
    const paths = noteFiles.map((f) => `${user.id}/${f.name}`);
    await supabase.storage.from("note-attachments").remove(paths);
  }

  // Delete auth.users row (cascades to profiles, notes, note_attachments)
  await supabase.rpc("delete_user");

  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard/settings/reset-password`,
  });

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/forgot-password?success=1");
}
