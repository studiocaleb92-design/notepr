"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { updateAvatar, deleteAccount } from "@/app/actions/auth";

type Props = {
  fullName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
};

export default function SettingsClient({ fullName, email, initials, avatarUrl }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">Settings</h1>
      <p className="mb-10 text-sm text-zinc-500">Manage your account and preferences.</p>

      {/* Profile */}
      <section className="mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Profile</h2>
        <div className="flex items-center gap-5">
          <AvatarUpload initials={initials} avatarUrl={avatarUrl} />
          <div>
            <p className="text-sm font-semibold text-white">{fullName || "No name set"}</p>
            <p className="text-xs text-zinc-500">{email}</p>
            <p className="mt-1.5 text-[11px] text-zinc-600">
              Click the avatar to upload a new photo (max 5 MB)
            </p>
          </div>
        </div>
      </section>

      {/* Account info */}
      <section className="mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email address</p>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              Verified
            </span>
          </div>
          <div className="h-px bg-white/6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Plan</p>
              <p className="text-xs text-zinc-500">You are on the free beta plan.</p>
            </div>
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
              Beta
            </span>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <DangerZone />
    </div>
  );
}

/* ── Avatar upload widget ─────────────────────────────────── */
function AvatarUpload({ initials, avatarUrl }: { initials: string; avatarUrl: string | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);

    const fd = new FormData();
    fd.set("avatar", file);

    startTransition(async () => {
      try {
        await updateAvatar(fd);
      } catch (err) {
        setError((err as Error).message);
        setPreview(avatarUrl); // revert
      }
    });
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Change avatar"
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-2xl font-bold text-accent ring-2 ring-accent/20 transition-all hover:ring-accent/50 disabled:opacity-70"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span>{initials}</span>
        )}

        {/* Hover overlay */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isPending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 8l-5-5-5 5M12 3v12" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="absolute -bottom-6 left-0 whitespace-nowrap text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Danger zone ──────────────────────────────────────────── */
function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirmText !== "DELETE") return;
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <section className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6">
      <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-red-500/70">
        Danger zone
      </h2>

      <div className="space-y-4">
        {/* Delete account row */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete account</p>
              <p className="text-xs text-zinc-500">
                Permanently delete your account and all notes. This cannot be undone.
              </p>
            </div>
            {!confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
              >
                Delete account
              </button>
            )}
          </div>

          {/* Confirmation panel */}
          {confirming && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-3 text-xs text-zinc-400">
                This will permanently delete your account, all your notes, and all
                attachments. Type{" "}
                <span className="font-bold text-red-400">DELETE</span> to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                autoFocus
                className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE" || isPending}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />
                  )}
                  Yes, delete everything
                </button>
                <button
                  onClick={() => { setConfirming(false); setConfirmText(""); }}
                  className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
