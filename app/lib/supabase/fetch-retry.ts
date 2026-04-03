const RETRIES = 3;
const BASE_DELAY_MS = 80;

function isRetryableFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message.toLowerCase();
  if (m.includes("fetch failed")) return true;
  const cause = err.cause;
  if (cause instanceof Error) {
    const c = cause.message.toLowerCase();
    if (
      c.includes("econnreset") ||
      c.includes("etimedout") ||
      c.includes("econnrefused") ||
      c.includes("enotfound") ||
      c.includes("eai_again") ||
      c.includes("socket") ||
      c.includes("network")
    ) {
      return true;
    }
  }
  return false;
}

/** Wraps fetch with a few retries for transient TLS/DNS/network failures (common on Windows / dev). */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      lastError = err;
      if (!isRetryableFetchError(err) || attempt === RETRIES - 1) {
        break;
      }
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt));
    }
  }
  throw lastError;
}

/** Improves opaque "fetch failed" messages from the Supabase client. */
export function formatSupabaseClientError(error: { message?: string }): string {
  const message = error.message ?? "Unknown error";
  if (!/fetch failed/i.test(message)) return message;
  return `${message} If this keeps happening, check your network, VPN or firewall, and NEXT_PUBLIC_SUPABASE_URL.`;
}
