import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NotePR — Account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      {/* Minimal top bar */}
      <header className="flex h-16 items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
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
      </header>

      {/* Page content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
