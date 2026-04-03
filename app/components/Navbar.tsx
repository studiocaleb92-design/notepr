"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Slide down from above on page load
      gsap.from(navRef.current, {
        y: -64,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.05,
      });

      // Logo + nav items stagger in after bar appears
      gsap.from(".nav-item", {
        y: -12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        delay: 0.35,
      });
    },
    { scope: navRef },
  );

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-transparent bg-ink/80 backdrop-blur-md transition-all duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="nav-item flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a.5.5 0 0 1-.8.4L8 11.333l-4.2 2.567A.5.5 0 0 1 3 13.5v-11Z"
                fill="white"
              />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-white">NotePR</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <a href="#features" className="nav-item text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="nav-item text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="nav-item text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Pricing
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a href="/login" className="nav-item hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white sm:block">
            Sign in
          </a>
          <a
            href="/signup"
            className="nav-item rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Get Early Access
          </a>
        </div>
      </div>
    </header>
  );
}
