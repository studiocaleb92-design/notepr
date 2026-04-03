"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  {
    number: "01",
    label: "Voice to Text",
    headline: "Speak freely. Your notes write themselves.",
    body: "Just hit record. NotePR streams your voice through OpenAI Whisper in real time — or processes uploaded audio files in the background. Either way, you get clean, editable text ready for the next step.",
    visual: <VoiceVisual />,
  },
  {
    number: "02",
    label: "AI Summarization",
    headline: "Long notes. Short time. Zero information lost.",
    body: "GPT-4 reads your raw transcripts and extracts what matters: key points, action items, and open questions. Structured, scannable, and always linked back to the original.",
    visual: <SummaryVisual />,
  },
  {
    number: "03",
    label: "Semantic Search",
    headline: "Search by meaning, not memory.",
    body: "Forget exact keywords. Ask \"What did I decide about the Q4 budget?\" and NotePR finds the right notes — using vector embeddings that understand intent, not just text.",
    visual: <SearchVisual />,
  },
];

export default function FeatureHighlights() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>(".highlight-row");

      rows.forEach((row, i) => {
        const reversed = i % 2 !== 0;
        const textSide = row.querySelector<HTMLElement>(".highlight-text");
        const visualSide = row.querySelector<HTMLElement>(".highlight-visual");

        const trigger = { trigger: row, start: "top 78%" };

        gsap.from(textSide, {
          x: reversed ? 70 : -70,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: trigger,
        });

        gsap.from(visualSide, {
          x: reversed ? -70 : 70,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: trigger,
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="features" className="bg-white px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl space-y-0">
        {highlights.map((item, i) => (
          <HighlightRow key={item.number} item={item} reversed={i % 2 !== 0} last={i === highlights.length - 1} />
        ))}
      </div>
    </section>
  );
}

function HighlightRow({
  item,
  reversed,
  last,
}: {
  item: (typeof highlights)[number];
  reversed: boolean;
  last: boolean;
}) {
  return (
    <div
      className={`highlight-row grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 ${
        !last ? "border-b border-border" : ""
      }`}
    >
      {/* Text side */}
      <div className={`highlight-text flex flex-col gap-6 ${reversed ? "lg:order-2" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="text-6xl font-black leading-none tracking-tighter text-surface-2 select-none">
            {item.number}
          </span>
          <span className="rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-muted-text">
            {item.label}
          </span>
        </div>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink lg:text-4xl">
          {item.headline}
        </h2>
        <p className="text-base leading-relaxed text-text-muted">{item.body}</p>
        <a
          href="#"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          Learn more
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Visual side */}
      <div className={`highlight-visual flex justify-center ${reversed ? "lg:order-1" : ""}`}>
        {item.visual}
      </div>
    </div>
  );
}

function VoiceVisual() {
  const bars = [3, 5, 8, 6, 4, 9, 7, 5, 3, 6, 8, 4, 7, 5, 9, 6, 3, 5];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Live Dictation</span>
        <span className="flex items-center gap-2 text-xs font-medium text-red-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Recording
        </span>
      </div>
      {/* Waveform */}
      <div className="mb-5 flex h-12 items-center justify-center gap-0.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-accent"
            style={{ height: `${(h / 9) * 100}%`, opacity: 0.5 + (h / 9) * 0.5 }}
          />
        ))}
      </div>
      <div className="rounded-lg bg-white p-3 shadow-xs border border-border-soft">
        <p className="text-sm leading-relaxed text-text-secondary">
          {`"...and the main takeaway from today's discussion is that we need to prioritize the mobile experience before the Q4 launch..."`}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
        <span>00:04:23</span>
        <span>Whisper API &middot; &lt; 3s latency</span>
      </div>
    </div>
  );
}

function SummaryVisual() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5 3 10l.6-3.2L1.2 4.5l3.3-.5L6 1Z" fill="white" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-ink">AI Summary</span>
        <span className="ml-auto rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-muted-text">
          GPT-4
        </span>
      </div>

      <div className="space-y-3">
        <SummaryBlock
          icon="●"
          color="text-blue-500"
          bg="bg-blue-50"
          label="Key Points"
          items={["Prioritize mobile UX before Q4 launch", "Budget confirmed at $240k"]}
        />
        <SummaryBlock
          icon="✓"
          color="text-amber-600"
          bg="bg-amber-50"
          label="Action Items"
          items={["Design team to deliver mockups by Fri", "Engineering spike on WebSocket perf"]}
        />
        <SummaryBlock
          icon="?"
          color="text-rose-500"
          bg="bg-rose-50"
          label="Open Questions"
          items={["Who owns the API integration timeline?"]}
        />
      </div>
    </div>
  );
}

function SummaryBlock({
  icon,
  color,
  bg,
  label,
  items,
}: {
  icon: string;
  color: string;
  bg: string;
  label: string;
  items: string[];
}) {
  return (
    <div className={`rounded-xl ${bg} p-3`}>
      <div className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${color}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
            <span className="mt-0.5 shrink-0">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchVisual() {
  const results = [
    { title: "Q4 Strategy Meeting", match: "...budget confirmed at $240k for mobile push...", tags: ["Q4", "Budget"] },
    { title: "Product Roadmap 2024", match: "...mobile-first approach agreed by leadership...", tags: ["Roadmap", "Mobile"] },
  ];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
      {/* Search input */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-accent/40 bg-white px-4 py-3 shadow-sm ring-2 ring-accent/10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-ink">What did we decide about Q4 budget?</span>
      </div>

      <p className="mb-3 text-xs text-text-muted">2 results from your notes</p>

      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.title} className="rounded-xl border border-border bg-white p-3 shadow-xs">
            <p className="mb-1 text-xs font-semibold text-ink">{r.title}</p>
            <p className="mb-2 text-xs leading-relaxed text-text-muted">{r.match}</p>
            <div className="flex gap-1.5">
              {r.tags.map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
