"use client";

import { useState, useTransition } from "react";
import type { NoteFolder } from "@/app/actions/notes";
import { createFolder } from "@/app/actions/notes";

export type FolderFilter = "all" | "inbox" | string;

type Props = {
  folders: NoteFolder[];
  activeFilter: FolderFilter;
  onFilterChange: (f: FolderFilter) => void;
  onFoldersChange: (folders: NoteFolder[]) => void;
};

export default function FolderNav({
  folders,
  activeFilter,
  onFilterChange,
  onFoldersChange,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function handleAddFolder(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setAdding(false);
      return;
    }
    startTransition(async () => {
      const folder = await createFolder(name);
      onFoldersChange([...folders, folder]);
      onFilterChange(folder.id);
      setNewName("");
      setAdding(false);
    });
  }

  return (
    <div className="border-b border-white/8 px-2 py-2">
      <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
        Folders
      </p>
      <div className="flex flex-col gap-0.5">
        <FilterBtn
          label="All notes"
          active={activeFilter === "all"}
          onClick={() => onFilterChange("all")}
        />
        <FilterBtn
          label="Inbox"
          active={activeFilter === "inbox"}
          onClick={() => onFilterChange("inbox")}
        />
        {folders.map((f) => (
          <FilterBtn
            key={f.id}
            label={f.name}
            active={activeFilter === f.id}
            onClick={() => onFilterChange(f.id)}
          />
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAddFolder} className="mt-2 flex gap-1 px-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white placeholder-zinc-600 outline-none focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-accent px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName(""); }}
            className="rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:text-white"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          New folder
        </button>
      )}
    </div>
  );
}

function FilterBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition-all ${
        active
          ? "bg-accent/15 text-accent ring-1 ring-accent/25"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
