"use client";

import { Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { resetPassword } from "@/app/actions/auth";

gsap.registerPlugin(useGSAP);

function ForgotPasswordContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

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

  return (
    <div ref={containerRef} className="w-full max-w-md">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent opacity-[0.08] blur-[100px]"
        aria-hidden="true"
      />

      <div className="auth-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm">
        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-green-400" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="auth-item text-xl font-bold text-white">Check your email</h2>
              <p className="auth-item mt-2 text-sm leading-relaxed text-zinc-400">
                We&apos;ve sent a password reset link to your inbox. It expires in 1 hour.
              </p>
            </div>
            <a
              href="/login"
              className="auth-item mt-2 text-sm font-semibold text-accent hover:underline"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          /* ── Request form ── */
          <>
            <div className="mb-8 text-center">
              <div className="auth-item mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="16" r="1.25" fill="currentColor" />
                </svg>
              </div>
              <h1 className="auth-item text-2xl font-extrabold tracking-tight text-white">
                Reset your password
              </h1>
              <p className="auth-item mt-2 text-sm text-zinc-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="auth-item mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {decodeURIComponent(error)}
              </div>
            )}

            <form action={resetPassword} className="space-y-4">
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div className="auth-item pt-2">
                <button
                  type="submit"
                  className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0"
                >
                  Send reset link
                </button>
              </div>
            </form>

            <p className="auth-item mt-6 text-center text-sm text-zinc-500">
              Remembered your password?{" "}
              <a href="/login" className="font-semibold text-accent hover:underline">
                Sign in
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="min-h-[28rem] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
