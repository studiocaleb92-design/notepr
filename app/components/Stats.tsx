"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  {
    value: "< 3s",
    label: "Transcription latency",
    description: "Real-time Whisper streaming, every time.",
    numeric: null,
  },
  {
    value: "100%",
    label: "Data privacy",
    description: "Row-Level Security. Your notes are yours alone.",
    numeric: 100,
    suffix: "%",
  },
  {
    value: "GPT-4",
    label: "AI engine",
    description: "Summaries, tags, and chat powered by state-of-the-art LLM.",
    numeric: null,
  },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Entrance — each stat item slides up
      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 0.85,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 82%" },
      });

      // Count-up for the "100%" stat
      const counterEl = document.querySelector<HTMLElement>(".stat-counter");
      if (counterEl) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 100,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: counterEl, start: "top 82%" },
          onUpdate() {
            counterEl.textContent = Math.round(obj.val) + "%";
          },
        });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-ink px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  value,
  label,
  description,
  numeric,
}: {
  value: string;
  label: string;
  description: string;
  numeric: number | null;
  suffix?: string;
}) {
  return (
    <div className="stat-item flex flex-col items-center gap-3 px-10 py-10 text-center first:pl-0 last:pr-0 sm:py-6">
      <span
        className={`text-5xl font-black tracking-tight text-white lg:text-6xl ${
          numeric !== null ? "stat-counter" : ""
        }`}
      >
        {value}
      </span>
      <span className="text-sm font-semibold uppercase tracking-widest text-accent">{label}</span>
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}
