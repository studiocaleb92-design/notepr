"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background glow blooms in
      gsap.from(glowRef.current, {
        scale: 0.3,
        opacity: 0,
        duration: 1.8,
        ease: "power2.out",
      });

      // Left column stagger
      tl.from(".hero-pill", { y: 24, opacity: 0, duration: 0.7 }, 0.1)
        .from(".hero-h1", { y: 36, opacity: 0, duration: 0.9 }, 0.22)
        .from(".hero-subtitle", { y: 24, opacity: 0, duration: 0.8 }, 0.38)
        .from(".hero-social", { opacity: 0, duration: 0.6 }, 0.72);

      // Mockup enters with a slight 3-D lean then settles
      tl.from(
        mockupRef.current,
        {
          y: 70,
          opacity: 0,
          rotationX: 8,
          duration: 1.1,
          ease: "power4.out",
          transformOrigin: "50% 80%",
        },
        0.3,
      );

      // Floating badge pops in with spring
      tl.from(
        badgeRef.current,
        {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(2)",
        },
        0.85,
      );

      // Continuous gentle float on the mockup after entrance
      gsap.to(mockupRef.current, {
        y: -10,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4,
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-ink px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28"
    >
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Glow blob */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent opacity-[0.12] blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col items-start gap-8">
            <span className="hero-pill inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                AI-Powered Note Intelligence
              </span>
            </span>

            <h1 className="hero-h1 text-5xl font-extrabold leading-[1.05] tracking-tight text-white lg:text-6xl xl:text-7xl">
              Your notes,{" "}
              <span className="bg-gradient-to-r from-accent to-violet-300 bg-clip-text text-transparent">
                finally intelligent.
              </span>
            </h1>

            <p className="hero-subtitle max-w-lg text-lg leading-relaxed text-zinc-400">
              NotePR transcribes your voice, summarizes your thoughts, and lets you search your
              entire knowledge base with plain language — powered by GPT-4 and built for the way
              you actually think.
            </p>

            <div className="hero-ctas flex flex-wrap items-center gap-4">
              <a
                href="/signup"
                className="hero-cta-1 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40 hover:-translate-y-0.5"
                style={{ animation: "heroCta 0.7s ease forwards", animationDelay: "0.5s", opacity: 0 }}
              >
                Start for free
              </a>
              <a
                href="#how-it-works"
                className="hero-cta-2 flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5"
                style={{ animation: "heroCta 0.7s ease forwards", animationDelay: "0.62s", opacity: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5Z" fill="currentColor" />
                </svg>
                See how it works
              </a>
            </div>

            <p className="hero-social text-xs text-zinc-500">
              No credit card required &middot; Free during beta
            </p>
          </div>

          {/* Right — product mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div ref={mockupRef} className="relative w-full max-w-md">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-2xl" aria-hidden="true" />

              {/* Main card */}
              <div className="relative rounded-2xl border border-white/10 bg-ink-soft/80 p-1 shadow-2xl backdrop-blur-sm">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-zinc-500">
                    notepr.app/notes/q4-strategy
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Q4 Strategy Meeting</h3>
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                        Transcribed
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">Oct 26, 2023 &middot; 42 min recording</p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5 3 10l.6-3.2L1.2 4.5l3.3-.5L6 1Z" fill="#7C3AED" />
                        </svg>
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                        AI Summary
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <SummaryLine label="Key Point" text="Launch new pricing tiers by Nov 15" />
                      <SummaryLine label="Action Item" text="Design team to finalize brand refresh" />
                      <SummaryLine label="Open Question" text="Budget approval needed from finance" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["Strategy", "Q4", "Pricing", "Design"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-medium text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                      + AI Tagged
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-500" aria-hidden="true">
                      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs text-zinc-500">Ask your notes anything...</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div
                ref={badgeRef}
                className="absolute -right-4 -top-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink-soft px-3 py-2 shadow-xl"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-xs font-medium text-zinc-300">Live transcription</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryLine({ label, text }: { label: string; text: string }) {
  const colors: Record<string, string> = {
    "Key Point": "text-blue-400",
    "Action Item": "text-amber-400",
    "Open Question": "text-rose-400",
  };
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide ${colors[label]}`}>
        {label}
      </span>
      <span className="text-xs leading-relaxed text-zinc-300">{text}</span>
    </div>
  );
}
