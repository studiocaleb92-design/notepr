import Link from "next/link";

const links = [
  {
    heading: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Use cases",
    items: [
      { label: "Students", href: "#" },
      { label: "Meeting notes", href: "#" },
      { label: "Research", href: "#" },
      { label: "Personal KB", href: "#" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookie policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/8 px-6 pt-16 pb-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top row */}
        <div className="mb-12 grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a.5.5 0 0 1-.8.4L8 11.333l-4.2 2.567A.5.5 0 0 1 3 13.5v-11Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span className="text-base font-bold text-white">NotePR</span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-500">
              AI-powered notes for students and productivity-focused individuals.
            </p>
          </div>

          {/* Link columns */}
          {links.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} NotePR. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">Built with</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-400">
                Next.js
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-400">
                Supabase
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-400">
                OpenAI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
