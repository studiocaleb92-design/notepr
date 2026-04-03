"use client";

import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Note, NoteFolder } from "@/app/actions/notes";
import { deleteNote } from "@/app/actions/notes";
import DashboardSidebar from "../../components/DashboardSidebar";
import FolderNav, { type FolderFilter } from "./FolderNav";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import AllNotesView from "./AllNotesView";
import SettingsClient from "../settings/SettingsClient";

type Props = {
  initialNotes: Note[];
  initialFolders: NoteFolder[];
  user: User;
  avatarUrl: string | null;
};

function filterNotesByFolder(notes: Note[], filter: FolderFilter): Note[] {
  if (filter === "all") return notes;
  if (filter === "inbox") return notes.filter((n) => !n.folder_id);
  return notes.filter((n) => n.folder_id === filter);
}

function folderIdForNewNote(filter: FolderFilter): string | null {
  if (filter === "all" || filter === "inbox") return null;
  return filter;
}

export default function NotesShell({
  initialNotes,
  initialFolders,
  user,
  avatarUrl,
}: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [folders, setFolders] = useState<NoteFolder[]>(initialFolders);
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotes = useMemo(
    () => filterNotesByFolder(notes, folderFilter),
    [notes, folderFilter],
  );

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const email = user.email ?? "";
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || email[0]?.toUpperCase() || "?";

  function handleSelect(note: Note) {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists ? prev : [note, ...prev];
    });
    setActiveNote(note);
    setShowSettings(false);
  }

  function handleNoteChange(updated: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote?.id
          ? { ...n, ...updated, updated_at: new Date().toISOString() }
          : n,
      ),
    );
    if (activeNote) setActiveNote((prev) => prev && { ...prev, ...updated });
  }

  function handleDelete(id: string) {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNote?.id === id) {
      setActiveNote(remaining[0] ?? null);
    }
    deleteNote(id);
  }

  const newNoteFolderId = folderIdForNewNote(folderFilter);

  const listSlot = (
    <div className="flex flex-col">
      <FolderNav
        folders={folders}
        activeFilter={folderFilter}
        onFilterChange={setFolderFilter}
        onFoldersChange={setFolders}
      />
      <NotesList
        notes={filteredNotes}
        activeId={activeNote?.id ?? null}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onViewAll={() => { setActiveNote(null); setShowSettings(false); }}
        folderIdForNewNote={newNoteFolderId}
      />
    </div>
  );

  return (
    <>
      <DashboardSidebar
        user={user}
        avatarUrl={avatarUrl}
        listSlot={listSlot}
        isSettings={showSettings}
        onSettingsOpen={() => setShowSettings(true)}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {showSettings ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
              <button
                onClick={() => setShowSettings(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/8 hover:text-white"
                aria-label="Back to notes"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-white">Settings</span>
            </div>
            <SettingsClient
              fullName={fullName}
              email={email}
              initials={initials}
              avatarUrl={avatarUrl}
            />
          </div>
        ) : activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            folders={folders}
            onNoteChange={handleNoteChange}
          />
        ) : (
          <AllNotesView
            notes={filteredNotes}
            onSelect={handleSelect}
            onDelete={handleDelete}
            folderIdForNewNote={newNoteFolderId}
            folderLabel={
              folderFilter === "all"
                ? "All notes"
                : folderFilter === "inbox"
                  ? "Inbox"
                  : folders.find((f) => f.id === folderFilter)?.name ?? "Folder"
            }
          />
        )}
      </main>
    </>
  );
}
