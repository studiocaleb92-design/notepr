import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import DashboardSidebar from "../../components/DashboardSidebar";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const email = user?.email ?? "";
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || email[0]?.toUpperCase() || "?";

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user?.id)
    .single();

  let avatarSignedUrl: string | null = null;
  if (profile?.avatar_url) {
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_url, 3600);
    avatarSignedUrl = data?.signedUrl ?? null;
  }

  return (
    <>
      <DashboardSidebar user={user} avatarUrl={avatarSignedUrl} isSettings={true} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SettingsClient
            fullName={fullName}
            email={email}
            initials={initials}
            avatarUrl={avatarSignedUrl}
          />
        </div>
      </main>
    </>
  );
}
