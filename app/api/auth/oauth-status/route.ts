import { NextResponse } from "next/server";
import { getSupabaseServerEnv } from "@/app/lib/supabase/env";

/**
 * Reads GoTrue /auth/v1/settings (anon key) to see if Google OAuth is enabled.
 * Avoids sending users to the authorize URL when the provider is off (raw JSON error page).
 */
export async function GET() {
  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseServerEnv());
  } catch {
    return NextResponse.json(
      { googleEnabled: false, projectRef: null as string | null },
      { status: 200 },
    );
  }

  let projectRef: string | null = null;
  try {
    const host = new URL(url).hostname;
    if (host.endsWith(".supabase.co")) {
      projectRef = host.replace(".supabase.co", "");
    }
  } catch {
    projectRef = null;
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ googleEnabled: false, projectRef });
    }

    const data = (await res.json()) as { external?: Record<string, boolean> };
    const googleEnabled = data?.external?.google === true;

    return NextResponse.json({ googleEnabled, projectRef });
  } catch {
    return NextResponse.json({ googleEnabled: false, projectRef });
  }
}
