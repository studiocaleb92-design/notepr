"use client";

import { Suspense, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { resendSignupConfirmation, signIn } from "@/app/actions/auth";
import GoogleSignInButton from "../components/GoogleSignInButton";

gsap.registerPlugin(useGSAP);

function isEmailNotConfirmedMessage(message: string): boolean {
  return /email not confirmed/i.test(message);
}

function LoginContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const pendingVerification = searchParams.get("pending_verification");

  const decodedError = error ? decodeURIComponent(error) : "";
  const isUnconfirmedFlow =
    !!pendingVerification || isEmailNotConfirmedMessage(decodedError);

  const [email, setEmail] = useState(() => {
    if (!pendingVerification) return "";
    try {
      return decodeURIComponent(pendingVerification);
    } catch {
      return pendingVerification;
    }
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(isUnconfirmedFlow);
  const [resendFeedback, setResendFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [isResending, startResendTransition] = useTransition();

  useGSAP(
    () => {
      gsap.from(".auth-card", {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from(".auth-item", {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
      });
    },
    { scope: containerRef },
  );

  function handleResendFromDialog() {
    setResendFeedback(null);
    startResendTransition(async () => {
      const result = await resendSignupConfirmation(email);
      setResendFeedback({ ok: result.ok, text: result.message });
    });
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Email confirmation dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-email-title"
          aria-describedby="confirm-email-desc"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowConfirmDialog(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 id="confirm-email-title" className="text-lg font-bold text-white">
              Confirm your email to sign in
            </h2>
            <p id="confirm-email-desc" className="mt-2 text-sm leading-relaxed text-zinc-400">
              Your account exists, but this email isn&apos;t verified yet. Use the link we sent you, or
              request a new confirmation email below.
            </p>

            <label htmlFor="dialog-email" className="mt-5 block text-xs font-semibold text-zinc-500">
              Email
            </label>
            <input
              id="dialog-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
            />

            {resendFeedback && (
              <div
                className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                  resendFeedback.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {resendFeedback.text}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDialog(false);
                  const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
                  router.push(`/verify-email${q}`);
                }}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
              >
                Full instructions
              </button>
              <button
                type="button"
                onClick={handleResendFromDialog}
                disabled={isResending || !email.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
              >
                {isResending ? "Sending…" : "Resend email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.08] blur-[100px]"
        aria-hidden="true"
      />

      <div className="auth-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="auth-item mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              AI-Powered Note Intelligence
            </span>
          </span>
          <h1 className="auth-item mt-4 text-2xl font-extrabold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="auth-item mt-2 text-sm text-zinc-400">
            Sign in to your NotePR account
          </p>
        </div>

        {/* Error banner (hide when unconfirmed — dialog handles it) */}
        {error && !isUnconfirmedFlow && (
          <div className="auth-item mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {decodedError}
          </div>
        )}

        {isUnconfirmedFlow && !showConfirmDialog && (
          <div className="auth-item mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <span>Email not verified.</span>
            <button
              type="button"
              onClick={() => setShowConfirmDialog(true)}
              className="shrink-0 font-semibold text-accent hover:underline"
            >
              What to do
            </button>
          </div>
        )}

        <div className="auth-item mb-6 space-y-4">
          <GoogleSignInButton label="Continue with Google" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
              <span className="bg-white/[0.04] px-3 text-zinc-500">or email</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form action={signIn} className="space-y-4">
          <div className="auth-item">
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="auth-item">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-400">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="auth-item pt-2">
            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Footer link */}
        <p className="auth-item mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="min-h-[28rem] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
