"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

gsap.registerPlugin(ScrollTrigger);

export default function CTABand() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Section scale + fade on scroll entry
      gsap.from(sectionRef.current, {
        scale: 0.96,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
      });

      // Inner content stagger
      gsap.from(".cta-content > *", {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        delay: 0.15,
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-accent px-6 py-24 lg:px-8"
    >
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-white opacity-10 blur-3xl"
        aria-hidden="true"
      />

      <div className="cta-content relative mx-auto max-w-3xl text-center">
        <span className="mb-6 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
          Free during beta
        </span>
        <h2 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">
          Stop losing ideas to bad notes.
          <br />
          Start building a knowledge base.
        </h2>
        <p className="mb-10 text-lg leading-relaxed text-violet-200">
          Join the waitlist and be first to try NotePR when it launches.
          No credit card required.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/signup"
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-bold text-accent shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
          >
            Get Early Access — It&rsquo;s Free
          </a>
          <a
            href="#features"
            className="w-full rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 sm:w-auto"
          >
            See all features
          </a>
        </div>

        <p className="mt-8 text-xs text-violet-300">
          No credit card &middot; Cancel anytime &middot; Privacy-first
        </p>
      </div>
    </section>
  );
}
