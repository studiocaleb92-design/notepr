"use client";

import { useTransition } from "react";
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type Props = {
  notes: Note[];
  activeId: string | null;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
  folderIdForNewNote: string | null;
};

export default function NotesList({
  notes,
  activeId,
  onSelect,
  onDelete,
  onViewAll,
  folderIdForNewNote,
}: Props) {
  const [isPending, startTransition] = useTransition();

  // Show only the 4 most recently updated notes
  const recent = notes.slice(0, 4);

  function handleCreate() {
    startTransition(async () => {
      const note = await createNote(folderIdForNewNote);
      onSelect(note);
    });
  }

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    onDelete(id);
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
        <button
          type="button"
          onClick={onViewAll}
          title="Open full note list in the main panel"
          className="text-left text-xs font-bold text-white transition-colors hover:text-accent"
        >
          My Notes
          <span className="mt-0.5 block text-[10px] font-normal text-zinc-500">
            4 recent here · tap for all
          </span>
        </button>
        <button
          onClick={handleCreate}
          disabled={isPending}
          aria-label="New note"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 text-accent transition-all hover:bg-accent hover:text-white disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 4 recent notes — no scroll */}
      {recent.length === 0 ? (
        <div className="px-3 py-4 text-center">
          <p className="text-[11px] text-zinc-600">No notes yet — create one!</p>
        </div>
      ) : (
        <ul className="space-y-px p-1.5">
          {recent.map((note) => (
            <li key={note.id}>
              <div
                className={`group relative w-full rounded-lg px-2.5 py-1.5 text-left transition-all ${
                  activeId === note.id
                    ? "bg-accent/15 ring-1 ring-accent/20"
                    : "hover:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(note)}
                  className="w-full text-left"
                >
                  {/* Title + date */}
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-xs font-semibold ${activeId === note.id ? "text-white" : "text-zinc-200"}`}>
                      {note.title || "Untitled"}
                    </p>
                    <span className="shrink-0 text-[10px] text-zinc-600">
                      {formatDate(note.updated_at)}
                    </span>
                  </div>

                  {/* Preview */}
                  <p className="truncate text-[11px] text-zinc-500">
                    {stripHtml(note.content) || "No content"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, note.id)}
                  aria-label="Delete note"
                  className="absolute right-1.5 top-1.5 z-10 hidden rounded p-0.5 text-zinc-600 transition-colors hover:bg-red-500/15 hover:text-red-400 group-hover:flex"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
