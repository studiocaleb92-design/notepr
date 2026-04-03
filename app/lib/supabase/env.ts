/** Trimmed Supabase URL and anon key, validated for server/middleware clients. */
export function getSupabaseServerEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be an absolute URL (e.g. https://xxx.supabase.co).",
    );
  }
  return { url, anonKey };
}
