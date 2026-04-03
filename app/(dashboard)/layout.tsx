import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import DashboardScrollLock from "./components/DashboardScrollLock";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <DashboardScrollLock />
      <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden overscroll-none bg-ink">
        {children}
      </div>
    </>
  );
}
