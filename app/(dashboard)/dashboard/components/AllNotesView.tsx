"use client";

import { useState, useTransition } from "react";
import type { Note } from "@/app/actions/notes";
import { createNote } from "@/app/actions/notes";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type Props = {
  notes: Note[];
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  folderIdForNewNote: string | null;
  folderLabel: string;
};

type ViewMode = "grid" | "list";

export default function AllNotesView({
  notes,
  onSelect,
  onDelete,
  folderIdForNewNote,
  folderLabel,
}: Props) {
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      stripHtml(n.content).toLowerCase().includes(query.toLowerCase()),
  );

  function handleCreate() {
    startTransition(async () => {
      const note = await createNote(folderIdForNewNote);
      onSelect(note);
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-white">{folderLabel}</h1>
          <p className="text-xs text-zinc-500">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
            {folderLabel !== "All notes" && (
              <span className="text-zinc-600"> · filtered</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-500" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-40 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-white/8 bg-white/4 p-0.5">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                view === "grid" ? "bg-accent/20 text-accent" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                view === "list" ? "bg-accent/20 text-accent" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* New note button */}
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-accent/80 disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            New note
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-400">
                {query ? "No notes match your search" : "No notes yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {query ? "Try a different search term" : "Create your first note to get started"}
              </p>
            </div>
            {!query && (
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent/80"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                Create a note
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Grid card ──────────────────────────────────────────────── */
function NoteCard({
  note,
  onSelect,
  onDelete,
}: {
  note: Note;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const plain = stripHtml(note.content);
  const hasImg = note.note_attachments?.some((a) => a.type === "image");
  const hasAud = note.note_attachments?.some((a) => a.type === "audio");
  const hasLink = note.links && note.links.length > 0;

  return (
    <div className="group relative flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-white/15 hover:bg-white/[0.06]">
      <button
        onClick={() => onSelect(note)}
        className="flex-1 text-left"
      >
        <p className="mb-1.5 truncate text-sm font-semibold text-white">
          {note.title || "Untitled"}
        </p>
        <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500">
          {plain || "No content"}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {hasImg && (
            <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">IMG</span>
          )}
          {hasAud && (
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">AUD</span>
          )}
          {hasLink && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">LINK</span>
          )}
        </div>
        <span className="text-[10px] text-zinc-600">{formatDate(note.updated_at)}</span>
      </div>

      {/* Delete button — appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        aria-label="Delete note"
        className="absolute right-2 top-2 hidden rounded-lg p-1 text-zinc-600 transition-colors hover:bg-red-500/15 hover:text-red-400 group-hover:flex"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ── List row ───────────────────────────────────────────────── */
function NoteRow({
  note,
  onSelect,
  onDelete,
}: {
  note: Note;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const plain = stripHtml(note.content);
  const hasImg = note.note_attachments?.some((a) => a.type === "image");
  const hasAud = note.note_attachments?.some((a) => a.type === "audio");
  const hasLink = note.links && note.links.length > 0;

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-all hover:border-white/8 hover:bg-white/[0.04]">
      {/* Note icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-zinc-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <button onClick={() => onSelect(note)} className="flex flex-1 items-center gap-4 text-left min-w-0">
        <p className="w-48 shrink-0 truncate text-sm font-semibold text-white">
          {note.title || "Untitled"}
        </p>
        <p className="flex-1 truncate text-xs text-zinc-500">
          {plain || "No content"}
        </p>
        <div className="flex shrink-0 gap-1">
          {hasImg && (
            <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">IMG</span>
          )}
          {hasAud && (
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">AUD</span>
          )}
          {hasLink && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">LINK</span>
          )}
        </div>
        <span className="shrink-0 text-xs text-zinc-600">{formatDate(note.updated_at)}</span>
      </button>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        aria-label="Delete note"
        className="hidden rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-red-500/15 hover:text-red-400 group-hover:flex"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
