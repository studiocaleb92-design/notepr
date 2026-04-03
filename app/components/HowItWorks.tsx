"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "1",
    phase: "Capture",
    headline: "Record or type your thoughts",
    description:
      "Dictate live with your mic or paste/upload any text or audio. NotePR accepts it all — no formatting required.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "2",
    phase: "Synthesize",
    headline: "AI extracts structure and meaning",
    description:
      "Whisper transcribes. GPT-4 summarizes, tags entities, and builds a vector embedding — all automatically, in the background.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "3",
    phase: "Retrieve",
    headline: "Find anything with natural language",
    description:
      "Search semantically or chat with your entire knowledge base. Every result links directly to the source note.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Header fade-up
      gsap.from(".hiw-header > *", {
        y: 26,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".hiw-header", start: "top 82%" },
      });

      // Connector line draws across left to right
      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".hiw-steps", start: "top 78%" },
        });
      }

      // Step circles pop in sequentially
      gsap.from(".step-circle", {
        scale: 0,
        opacity: 0,
        duration: 0.55,
        stagger: 0.2,
        ease: "back.out(2)",
        scrollTrigger: { trigger: ".hiw-steps", start: "top 78%" },
        delay: 0.3,
      });

      // Step text cascades in
      gsap.from(".step-text", {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: { trigger: ".hiw-steps", start: "top 78%" },
        delay: 0.5,
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-white px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="hiw-header mb-16 flex flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-muted-text">
            How it works
          </span>
          <h2 className="max-w-2xl text-4xl font-extrabold tracking-tight text-ink lg:text-5xl">
            From raw thought to searchable knowledge in three steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-steps relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line — desktop only */}
          <div
            ref={lineRef}
            className="pointer-events-none absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] hidden h-px bg-gradient-to-r from-border via-accent/40 to-border md:block"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  isLast,
}: {
  step: (typeof steps)[number];
  isLast: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step circle */}
      <div className="step-circle relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-accent/20 bg-white text-accent shadow-sm">
        {step.icon}
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
          {step.number}
        </span>
      </div>

      {/* Arrow between steps — mobile only */}
      {!isLast && (
        <div className="mb-6 flex items-center justify-center md:hidden" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-90 text-accent/40">
            <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className="step-text">
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-accent">
          {step.phase}
        </span>
        <h3 className="mb-3 text-xl font-bold text-ink">{step.headline}</h3>
        <p className="text-sm leading-relaxed text-text-muted">{step.description}</p>
      </div>
    </div>
  );
}
