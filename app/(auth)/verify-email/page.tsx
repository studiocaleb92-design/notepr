"use client";

import { Suspense, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { resendSignupConfirmation } from "@/app/actions/auth";

gsap.registerPlugin(useGSAP);

function VerifyEmailContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(() =>
    emailParam ? decodeURIComponent(emailParam) : "",
  );
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useGSAP(
    () => {
      gsap.from(".auth-card", { y: 32, opacity: 0, duration: 0.7, ease: "power3.out" });
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

  function handleResend() {
    setFeedback(null);
    startTransition(async () => {
      const result = await resendSignupConfirmation(email);
      setFeedback({ ok: result.ok, text: result.message });
    });
  }

  return (
    <div ref={containerRef} className="w-full max-w-md">
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.08] blur-[100px]"
        aria-hidden="true"
      />

      <div className="auth-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm">
        <div className="auth-item mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

        <h1 className="auth-item text-center text-2xl font-extrabold tracking-tight text-white">
          Confirm your email
        </h1>
        <p className="auth-item mt-3 text-center text-sm leading-relaxed text-zinc-400">
          We sent a confirmation link to your address. Open it to activate your account, then return here to sign in.
        </p>

        <div className="auth-item mt-6 space-y-3">
          <label htmlFor="verify-email" className="block text-xs font-semibold text-zinc-400">
            Email address
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {feedback && (
          <div
            className={`auth-item mt-4 rounded-xl border px-4 py-3 text-sm ${
              feedback.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="auth-item mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending || !email.trim()}
            className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover disabled:opacity-40"
          >
            {isPending ? "Sending…" : "Resend confirmation email"}
          </button>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </div>

        <p className="auth-item mt-6 text-center text-xs text-zinc-600">
          Didn&apos;t get the email? Check spam or promotions. You can resend above.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="min-h-[24rem] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
