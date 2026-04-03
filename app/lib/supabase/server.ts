import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchWithRetry } from "@/app/lib/supabase/fetch-retry";
import { getSupabaseServerEnv } from "@/app/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseServerEnv();

  return createServerClient(url, anonKey, {
    global: { fetch: fetchWithRetry },
    cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — cookies will be set by middleware
          }
        },
      },
    },
  );
}
