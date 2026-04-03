"use client";

import Image from "next/image";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";

export default function DashboardSidebar({
  user,
  avatarUrl,
  listSlot,
  isSettings = false,
  onSettingsOpen,
}: {
  user: User;
  avatarUrl: string | null;
  listSlot?: React.ReactNode;
  isSettings?: boolean;
  onSettingsOpen?: () => void;
}) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const initials = (user.user_metadata?.full_name as string | undefined)
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? user.email?.[0].toUpperCase() ?? "?";

  return (
    <>
      {/* Sign-out confirmation dialog */}
      {showSignOutDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSignOutDialog(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mb-1 text-base font-bold text-white">Sign out?</h2>
            <p className="mb-6 text-sm text-zinc-400">
              You will be signed out of your account on this device.
            </p>
            <div className="flex gap-3">
              <form action={signOut} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-100"
                >
                  Sign out
                </button>
              </form>
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden border-r border-white/8 bg-ink-soft">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/8 px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a.5.5 0 0 1-.8.4L8 11.333l-4.2 2.567A.5.5 0 0 1 3 13.5v-11Z"
                fill="white"
              />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight text-white">NotePR</span>
        </div>

        {/* Folders + last 4 notes: natural height, no sidebar scroll — use “My Notes” for the full list */}
        {listSlot ? (
          <>
            <div className="shrink-0 overflow-x-hidden border-b border-white/8">
              {listSlot}
            </div>
            <div className="min-h-0 flex-1" aria-hidden="true" />
          </>
        ) : (
          <div className="min-h-0 flex-1" />
        )}

        {/* User + sign out */}
        <div className="shrink-0 border-t border-white/8 p-3">
          <button
            type="button"
            onClick={onSettingsOpen}
            className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-white/5 ${
              isSettings ? "bg-accent/15" : ""
            }`}
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-xs font-bold text-accent">
              {avatarUrl
                ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                )
                : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-semibold ${isSettings ? "text-accent" : "text-white"}`}>
                {(user.user_metadata?.full_name as string | undefined) ?? "User"}
              </p>
              <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`shrink-0 ${isSettings ? "text-accent" : "text-zinc-600"}`} aria-hidden="true">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Sign out — opens confirmation dialog */}
          <button
            type="button"
            onClick={() => setShowSignOutDialog(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
