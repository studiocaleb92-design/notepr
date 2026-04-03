"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

gsap.registerPlugin(ScrollTrigger);

const TAG_COLORS = [
  "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30",
  "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30",
  "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30",
  "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
];

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Section header
      gsap.from(".fgrid-header > *", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".fgrid-header", start: "top 82%" },
      });

      // Bento cards — staggered fade + lift
      const cards = gsap.utils.toArray<HTMLElement>(".bento-card");
      cards.forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.85,
          delay: i * 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: ".fgrid-grid", start: "top 80%" },
        });
      });

      // Privacy strip
      gsap.from(".bento-privacy", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".bento-privacy", start: "top 88%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-ink px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="fgrid-header mb-14 flex flex-col items-center text-center">
          <span className="mb-4 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            Capabilities
          </span>
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
            Everything your notes need
            <br className="hidden sm:block" /> to work for you.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">
            A tight stack of best-in-class AI tools, wired together so your notes
            think, organize, and answer — without any manual effort.
          </p>
        </div>

        {/* Bento grid */}
        <div className="fgrid-grid grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2">
          {/* Card 1 — Voice (large, spans 2 cols) */}
          <BentoCardLarge
            span="md:col-span-2"
            accentFrom="#3B82F6"
            accentTo="#7C3AED"
            icon={<MicIcon />}
            label="Voice Transcription"
            headline="Speak freely. Your notes write themselves."
            description="Live dictation or async file upload. Whisper streams audio into clean, editable text in under 3 seconds."
            preview={<WaveformPreview />}
          />

          {/* Card 2 — AI Summary (small) */}
          <BentoCardSmall
            accentColor="#7C3AED"
            icon={<SparkleIcon />}
            label="AI Summarization"
            headline="Key points extracted automatically."
            description="GPT-4 surfaces structured briefs: key points, action items, and open questions — every time."
          />

          {/* Card 3 — Smart Tags (small) */}
          <BentoCardSmall
            accentColor="#F59E0B"
            icon={<TagIcon />}
            label="Smart Tagging"
            headline="Auto-tagged by topic, entity, and sentiment."
            description="Accept, reject, or edit AI-suggested tags. The system adapts to your corrections."
            preview={<TagPreview />}
          />

          {/* Card 4 — Semantic Search (small) */}
          <BentoCardSmall
            accentColor="#10B981"
            icon={<SearchIcon />}
            label="Semantic Search"
            headline="Search by meaning, not memory."
            description="Vector embeddings understand intent — not just keywords. Ask in plain English."
          />

          {/* Card 5 — Chat (large, spans 2 cols) */}
          <BentoCardLarge
            span="md:col-span-2"
            accentFrom="#F43F5E"
            accentTo="#7C3AED"
            icon={<ChatIcon />}
            label="Chat with Notes"
            headline="Ask anything across your entire knowledge base."
            description="Multi-hop reasoning with source citations on every answer. No hallucinations, no guessing."
            preview={<ChatPreview />}
          />
        </div>

        {/* Bottom full-width privacy card */}
        <div className="bento-privacy mt-3">
          <BentoCardPrivacy />
        </div>
      </div>
    </section>
  );
}

/* ─── Large card ─────────────────────────────────────────────────────────── */

function BentoCardLarge({
  span = "",
  accentFrom,
  accentTo,
  icon,
  label,
  headline,
  description,
  preview,
}: {
  span?: string;
  accentFrom: string;
  accentTo: string;
  icon: React.ReactNode;
  label: string;
  headline: string;
  description: string;
  preview?: React.ReactNode;
}) {
  return (
    <div
      className={`bento-card group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-7 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] ${span}`}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-35"
        style={{ background: `radial-gradient(circle, ${accentFrom}, ${accentTo})` }}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between gap-8">
        {/* Text */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${accentFrom}25, ${accentTo}15)`,
                border: `1px solid ${accentFrom}30`,
                color: accentFrom,
              }}
            >
              {icon}
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentFrom }}
            >
              {label}
            </span>
          </div>
          <h3 className="mb-2 text-xl font-bold leading-snug text-white">{headline}</h3>
          <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>

        {/* Preview */}
        {preview && <div className="shrink-0">{preview}</div>}
      </div>
    </div>
  );
}

/* ─── Small card ─────────────────────────────────────────────────────────── */

function BentoCardSmall({
  accentColor,
  icon,
  label,
  headline,
  description,
  preview,
}: {
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  headline: string;
  description: string;
  preview?: React.ReactNode;
}) {
  return (
    <div className="bento-card group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06]">
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-25"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}28`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
            {label}
          </span>
        </div>
        <h3 className="mb-2 text-base font-bold leading-snug text-white">{headline}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        {preview && <div className="mt-4">{preview}</div>}
      </div>
    </div>
  );
}

/* ─── Privacy full-width card ────────────────────────────────────────────── */

function BentoCardPrivacy() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] px-8 py-7 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-500/25 bg-slate-500/15 text-slate-300">
            <LockIcon />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Private by Default
            </span>
            <h3 className="mt-0.5 text-base font-bold text-white">
              Row-Level Security on every note. Your data belongs to you alone.
            </h3>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {["RLS Enforced", "Zero data sharing", "Signed URLs", "Auth isolation"].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline preview components ──────────────────────────────────────────── */

function WaveformPreview() {
  const heights = [30, 55, 80, 60, 90, 70, 50, 85, 65, 45, 75, 55, 40, 68, 80, 58, 35, 62, 88, 50];
  return (
    <div className="rounded-xl border border-white/8 bg-ink/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Recording — 00:02:47
        </span>
        <span className="text-[11px] text-zinc-500">Whisper API</span>
      </div>
      <div className="mb-3 flex h-8 items-center gap-0.5">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-blue-500"
            style={{ height: `${h}%`, opacity: 0.4 + (h / 90) * 0.6 }}
          />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-zinc-300">
        <span className="text-white">&ldquo;</span>
        …the main priority for next quarter is improving the onboarding flow. We need to cut time-to-value in half.
        <span className="text-white">&rdquo;</span>
      </p>
    </div>
  );
}

function TagPreview() {
  const tags = [
    { label: "Strategy", color: TAG_COLORS[0] },
    { label: "Q4", color: TAG_COLORS[1] },
    { label: "Onboarding", color: TAG_COLORS[2] },
    { label: "Product", color: TAG_COLORS[3] },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t.label} className={`rounded-full px-3 py-1 text-xs font-medium ${t.color}`}>
          {t.label}
        </span>
      ))}
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-500">
        + 3 more
      </span>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="rounded-xl border border-white/8 bg-ink/60 p-4 space-y-3">
      {/* User question */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-xs text-white">
          What did we decide about the mobile launch date?
        </div>
      </div>
      {/* AI answer */}
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
          <span className="text-[10px]">✦</span>
        </div>
        <div className="rounded-2xl rounded-bl-sm border border-white/8 bg-white/5 px-4 py-2.5 text-xs leading-relaxed text-zinc-300">
          The launch is set for <span className="font-semibold text-white">Nov 15</span>, contingent on QA sign-off.
          <a href="#" className="ml-1 text-accent underline-offset-2 hover:underline">
            ↗ Q4 Strategy Meeting
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" />
    </svg>
  );
}
