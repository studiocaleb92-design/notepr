"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function decodeParam(raw: string | null): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function AuthEmailCallbackAlertInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { title, detail, show } = useMemo(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDescription = decodeParam(searchParams.get("error_description"));

    if (!error && !errorCode) {
      return { title: "", detail: "", show: false };
    }

    if (errorCode === "otp_expired" || /otp_expired/i.test(errorDescription)) {
      return {
        show: true,
        title: "This confirmation link expired",
        detail:
          "Links expire after a short time for security. If you already confirmed, try signing in. Otherwise request a new email from the link below.",
      };
    }

    if (error === "access_denied") {
      return {
        show: true,
        title: "We couldn’t finish email confirmation",
        detail:
          errorDescription ||
          "The link may have expired, already been used, or didn’t match this app. Request a new confirmation email or sign in if your account is already active.",
      };
    }

    return {
      show: true,
      title: "Sign-in or confirmation issue",
      detail: errorDescription || error || "Something went wrong. Try signing in or request a new confirmation email.",
    };
  }, [searchParams]);

  if (!show) return null;

  function dismiss() {
    router.replace("/", { scroll: false });
  }

  return (
    <div
      className="sticky top-0 z-[100] border-b border-amber-500/35 bg-amber-950/95 px-4 py-3 text-center shadow-lg backdrop-blur-md"
      role="alert"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-amber-50">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/90">{detail}</p>
          <p className="mt-2 text-[11px] text-amber-200/60">
            If you see &quot;connection refused&quot;, start your dev server (<code className="rounded bg-black/30 px-1">npm run dev</code>)
            and use the link again, or copy it after the server is running.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
          <Link
            href="/verify-email"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
          >
            Resend confirmation
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-amber-400/40 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-white/10"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-2 py-1.5 text-xs text-amber-300/80 hover:text-amber-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthEmailCallbackAlert() {
  return (
    <Suspense fallback={null}>
      <AuthEmailCallbackAlertInner />
    </Suspense>
  );
}
