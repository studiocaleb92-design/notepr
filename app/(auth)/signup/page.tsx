"use client";

import { Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { signUp } from "@/app/actions/auth";

gsap.registerPlugin(useGSAP);

function SignupContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="auth-item mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Free during beta
            </span>
          </span>
          <h1 className="auth-item mt-4 text-2xl font-extrabold tracking-tight text-white">
            Create your account
          </h1>
          <p className="auth-item mt-2 text-sm text-zinc-400">
            Your AI-powered note intelligence awaits
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-item mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Form */}
        <form action={signUp} className="space-y-4">
          <div className="auth-item">
            <label htmlFor="full_name" className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            />
          </div>

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

          <div className="auth-item">
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="auth-item pt-2">
            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0"
            >
              Create account — it&apos;s free
            </button>
          </div>
        </form>

        {/* Terms */}
        <p className="auth-item mt-4 text-center text-xs text-zinc-600">
          By creating an account you agree to our{" "}
          <a href="#" className="text-zinc-500 hover:text-white">Terms</a> and{" "}
          <a href="#" className="text-zinc-500 hover:text-white">Privacy Policy</a>.
        </p>

        {/* Footer link */}
        <p className="auth-item mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="min-h-[32rem] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
