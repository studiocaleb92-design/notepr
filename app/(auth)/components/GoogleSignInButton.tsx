"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function friendlyOAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("unsupported provider") ||
    lower.includes("provider is not enabled") ||
    lower.includes("validation_failed")
  ) {
    return "GOOGLE_NOT_ENABLED";
  }
  return raw;
}

type Props = {
  label?: string;
};

type OauthStatus = {
  googleEnabled: boolean;
  projectRef: string | null;
};

export default function GoogleSignInButton({ label = "Continue with Google" }: Props) {
  const [status, setStatus] = useState<OauthStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/oauth-status")
      .then((r) => r.json())
      .then((d: OauthStatus) => {
        if (!cancelled) setStatus(d);
      })
      .catch(() => {
        if (!cancelled) setStatus({ googleEnabled: false, projectRef: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleClick() {
    if (!status?.googleEnabled) return;

    setError(null);
    setPending(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      });

      if (oauthError) {
        const msg = friendlyOAuthError(oauthError.message);
        setError(msg === "GOOGLE_NOT_ENABLED" ? setupHint(status.projectRef) : oauthError.message);
        setPending(false);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setError("Could not start Google sign-in.");
      setPending(false);
    } catch {
      setError("Something went wrong. Try again.");
      setPending(false);
    }
  }

  const dashboardProvidersUrl = status?.projectRef
    ? `https://supabase.com/dashboard/project/${status.projectRef}/auth/providers`
    : "https://supabase.com/dashboard/project/_/auth/providers";

  return (
    <div className="w-full space-y-3">
      {error && (
        <div
          className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-left text-xs leading-relaxed text-red-300"
          role="alert"
        >
          <p className="whitespace-pre-wrap break-words">{error}</p>
        </div>
      )}

      {status && !status.googleEnabled && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-left text-xs leading-relaxed text-amber-100">
          <p className="font-semibold text-amber-50">Google sign-in isn&apos;t on for this project</p>
          <p className="mt-2 text-amber-200/90">
            In Supabase open <strong>Authentication → Providers → Google</strong>, turn it on, and add your{" "}
            <strong>Client ID</strong> and <strong>Client secret</strong> from Google Cloud Console. In Google Cloud,
            set the authorized redirect URI to your Supabase callback (copy it from the Google provider card). Under{" "}
            <strong>Authentication → URL Configuration</strong>, add your site URLs (e.g.{" "}
            <code className="rounded bg-black/30 px-1 py-0.5 text-[11px]">http://localhost:3000/auth/callback</code> for local dev).
          </p>
          <a
            href={dashboardProvidersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-semibold text-accent hover:underline"
          >
            Open Supabase Auth providers →
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={pending || status === null || !status.googleEnabled}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white py-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleGlyph className="h-5 w-5 shrink-0" />
        {status === null
          ? "Checking Google…"
          : pending
            ? "Redirecting…"
            : !status.googleEnabled
              ? "Google unavailable (configure Supabase)"
              : label}
      </button>
    </div>
  );
}

function setupHint(projectRef: string | null): string {
  const dash = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/auth/providers`
    : "your Supabase dashboard → Authentication → Providers → Google";
  return `Google sign-in is not enabled. Enable it here: ${dash}`;
}
