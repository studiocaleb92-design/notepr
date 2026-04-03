"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import type { Note, NoteAttachment, NoteFolder } from "@/app/actions/notes";
import {
  updateNote,
  addAttachment,
  deleteAttachment,
  getAttachmentUrl,
} from "@/app/actions/notes";
import { summarizeNote, transcribeAudio, type SummaryResult } from "@/app/actions/ai";
import NoteChatPanel from "./NoteChatPanel";

/* ─── Whisper recording panel ────────────────────────────── */
function RecordingPanel({
  state,
  elapsed,
  onStop,
  onDismiss,
}: {
  state: "recording" | "transcribing" | "done" | "error";
  elapsed: number;
  onStop: () => void;
  onDismiss: () => void;
}) {
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 bg-white/[0.02] px-6 py-2.5">
      <div className="flex items-center gap-3">
        {state === "recording" && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        )}
        {state === "transcribing" && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        )}
        {state === "done" && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-emerald-400" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {state === "error" && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-red-400" aria-hidden="true">
            <path d="M8 5v4M8 11v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M7.134 2.5L1.5 13h13L8.866 2.5a1 1 0 0 0-1.732 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-xs font-medium text-zinc-300">
          {state === "recording" && `Recording — ${mins}:${secs}`}
          {state === "transcribing" && "Transcribing with Whisper…"}
          {state === "done" && "Transcript inserted"}
          {state === "error" && "Transcription failed"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {state === "recording" && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-500"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <rect width="10" height="10" rx="2" />
            </svg>
            Stop
          </button>
        )}
        {(state === "done" || state === "error") && (
          <button
            onClick={onDismiss}
            className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
function ToolbarBtn({
  label,
  title,
  active,
  onClick,
  children,
}: {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-zinc-400 hover:bg-white/8 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Link item ──────────────────────────────────────────── */
function LinkItem({
  link,
  onDelete,
}: {
  link: { url: string; label: string };
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent" aria-hidden="true">
        <path d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate text-accent hover:underline"
      >
        {link.label || link.url}
      </a>
      <button
        onClick={onDelete}
        aria-label="Remove link"
        className="shrink-0 rounded p-0.5 text-zinc-600 hover:text-red-400"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Attachment preview ─────────────────────────────────── */
function AttachmentCard({
  attachment,
  onDelete,
}: {
  attachment: NoteAttachment & { signedUrl?: string };
  onDelete: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/8 bg-white/4">
      {attachment.type === "image" && attachment.signedUrl ? (
        <div className="relative h-32 w-full">
          <Image
            src={attachment.signedUrl}
            alt={attachment.filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        </div>
      ) : attachment.type === "image" ? (
        <div className="flex h-32 w-full items-center justify-center bg-white/5 text-xs text-zinc-600">
          No preview
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {attachment.signedUrl && (
            <audio controls className="mt-1 h-8 w-full" src={attachment.signedUrl} />
          )}
        </div>
      )}
      <div className="border-t border-white/8 px-3 py-2">
        <p className="truncate text-xs text-zinc-400">{attachment.filename}</p>
      </div>
      <button
        onClick={onDelete}
        aria-label="Delete attachment"
        className="absolute right-2 top-2 hidden rounded-lg bg-black/60 p-1 text-zinc-400 backdrop-blur group-hover:flex hover:text-red-400"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Summary panel ──────────────────────────────────────── */
function SummaryPanel({
  summary,
  onRegenerate,
  onDismiss,
  onInsert,
  isLoading,
}: {
  summary: SummaryResult | null;
  onRegenerate: () => void;
  onDismiss: () => void;
  onInsert: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/[0.06] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sparkle icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent" aria-hidden="true">
            <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            AI Summary
          </span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
            AI Generated
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Insert into note */}
          {summary && !isLoading && (
            <button
              onClick={onInsert}
              title="Insert summary into note"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/8 hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v10M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Insert into note
            </button>
          )}
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            title="Regenerate summary"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8A6 6 0 1 1 8 2.5M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Regenerate
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss summary"
            className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-6 text-sm text-zinc-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Analysing your note…
        </div>
      ) : summary ? (
        <div className="space-y-5">
          {/* Key Points */}
          {summary.keyPoints.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Key Points
              </h4>
              <ul className="space-y-1.5">
                {summary.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {summary.actionItems.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Action Items
              </h4>
              <ul className="space-y-1.5">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true">
                      <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.25" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Open Questions */}
          {summary.openQuestions.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Open Questions
              </h4>
              <ul className="space-y-1.5">
                {summary.openQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm italic text-zinc-400">
                    <span className="mt-1 text-amber-400">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ─── Main editor ────────────────────────────────────────── */
type EnrichedAttachment = NoteAttachment & { signedUrl?: string };

type Props = {
  note: Note;
  folders: NoteFolder[];
  onNoteChange: (updated: Partial<Note>) => void;
};

export default function NoteEditor({ note, folders, onNoteChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  const [localTitle, setLocalTitle] = useState(note.title);
  const [links, setLinks] = useState<{ url: string; label: string }[]>(note.links ?? []);
  const [attachments, setAttachments] = useState<EnrichedAttachment[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Summary state ── */
  const [summary, setSummary] = useState<SummaryResult | null>(
    (note as Note & { summary?: SummaryResult }).summary ?? null,
  );
  const [showSummary, setShowSummary] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  /* ── Whisper recorder state ── */
  const savedRangeRef = useRef<Range | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [whisperState, setWhisperState] = useState<"idle" | "recording" | "transcribing" | "done" | "error">("idle");
  const [recElapsed, setRecElapsed] = useState(0);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync state when active note changes
  useEffect(() => {
    setLocalTitle(note.title);
    setLinks(note.links ?? []);
    setSummary((note as Note & { summary?: SummaryResult }).summary ?? null);
    setShowSummary(false);
    setSummaryError(null);

    if (editorRef.current) {
      editorRef.current.innerHTML = note.content ?? "";
    }

    // Load signed URLs for attachments
    const rawAttachments = (note.note_attachments ?? []) as NoteAttachment[];
    setAttachments(rawAttachments.map((a) => ({ ...a, signedUrl: undefined })));

    rawAttachments.forEach((a, i) => {
      startTransition(async () => {
        const url = await getAttachmentUrl(a.storage_path);
        setAttachments((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], signedUrl: url };
          return next;
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  /* ── Debounced save ── */
  const scheduleSave = useCallback(
    (fields: { title?: string; content?: string; links?: { url: string; label: string }[] }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        startTransition(async () => {
          await updateNote(note.id, fields);
          onNoteChange(fields);
        });
      }, 800);
    },
    [note.id, onNoteChange],
  );

  /* ── Track active formats ── */
  const refreshFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  /* ── Format commands ── */
  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      refreshFormats();
      const content = editorRef.current?.innerHTML ?? "";
      scheduleSave({ content });
    },
    [refreshFormats, scheduleSave],
  );

  /* ── Title change ── */
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setLocalTitle(title);
    scheduleSave({ title });
  }

  function handleFolderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    const folder_id = v === "" ? null : v;
    startTransition(async () => {
      await updateNote(note.id, { folder_id });
      onNoteChange({ folder_id });
    });
  }

  /* ── Editor content change ── */
  function handleEditorInput() {
    refreshFormats();
    const content = editorRef.current?.innerHTML ?? "";
    scheduleSave({ content });
  }

  /* ── Add link ── */
  function handleAddLink() {
    if (!linkUrl.trim()) return;
    const newLink = { url: linkUrl.trim(), label: linkLabel.trim() || linkUrl.trim() };
    const updated = [...links, newLink];
    setLinks(updated);
    setLinkUrl("");
    setLinkLabel("");
    setShowLinkInput(false);
    scheduleSave({ links: updated });
  }

  function handleRemoveLink(i: number) {
    const updated = links.filter((_, idx) => idx !== i);
    setLinks(updated);
    scheduleSave({ links: updated });
  }

  /* ── Attachments ── */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const fd = new FormData();
    fd.set("note_id", note.id);
    fd.set("file", file);

    try {
      const attachment = await addAttachment(fd);
      const url = await getAttachmentUrl(attachment.storage_path);
      setAttachments((prev) => [...prev, { ...attachment, signedUrl: url }]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteAttachment(attachment: EnrichedAttachment) {
    if (!confirm(`Delete "${attachment.filename}"?`)) return;
    startTransition(async () => {
      await deleteAttachment(attachment.id, attachment.storage_path);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    });
  }

  /* ── Shared: insert text at cursor inside editor ── */
  function insertTextAtCursor(text: string) {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    } else {
      editorRef.current!.innerHTML += text;
    }
    const newContent = editorRef.current!.innerHTML;
    scheduleSave({ content: newContent });
    onNoteChange({ content: newContent });
  }

  /* ── Live dictation: save cursor before focus leaves editor ── */
  function saveRange() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreRange() {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }

  /* ── Whisper: MediaRecorder record-and-transcribe ── */
  async function startWhisperRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setWhisperState("transcribing");

        try {
          const fd = new FormData();
          fd.append("audio", blob, `recording.${mimeType.includes("ogg") ? "ogg" : "webm"}`);
          const transcript = await transcribeAudio(fd);
          if (transcript) {
            restoreRange();
            insertTextAtCursor(transcript + " ");
          }
          setWhisperState("done");
        } catch {
          setWhisperState("error");
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;

      setRecElapsed(0);
      setWhisperState("recording");
      elapsedTimerRef.current = setInterval(() => setRecElapsed((s) => s + 1), 1000);
    } catch {
      setWhisperState("error");
    }
  }

  function stopWhisperRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }

  function dismissWhisperPanel() {
    setWhisperState("idle");
    setRecElapsed(0);
  }

  /* ── AI summarize ── */
  async function handleSummarize() {    setSummarizing(true);
    setSummaryError(null);
    setShowSummary(true);

    try {
      const content = editorRef.current?.innerHTML ?? note.content ?? "";
      const result = await summarizeNote(note.id, localTitle, content);
      setSummary(result);
    } catch (err) {
      setSummaryError((err as Error).message);
      setShowSummary(false);
    } finally {
      setSummarizing(false);
    }
  }

  /* ── Insert summary into editor ── */
  function handleInsertSummary() {
    if (!summary || !editorRef.current) return;

    const sections: string[] = [];

    sections.push(
      `<hr style="border-color:rgba(124,58,237,0.3);margin:1.5rem 0"/>` +
      `<p><strong>✦ AI Summary</strong></p>`,
    );

    if (summary.keyPoints.length > 0) {
      sections.push(`<p><strong>Key Points</strong></p><ul>${summary.keyPoints.map((p) => `<li>${p}</li>`).join("")}</ul>`);
    }
    if (summary.actionItems.length > 0) {
      sections.push(`<p><strong>Action Items</strong></p><ul>${summary.actionItems.map((p) => `<li>${p}</li>`).join("")}</ul>`);
    }
    if (summary.openQuestions.length > 0) {
      sections.push(`<p><strong>Open Questions</strong></p><ul>${summary.openQuestions.map((p) => `<li>${p}</li>`).join("")}</ul>`);
    }

    editorRef.current.innerHTML += sections.join("");
    const newContent = editorRef.current.innerHTML;
    scheduleSave({ content: newContent });
    onNoteChange({ content: newContent });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* ── Title ── */}
      <div className="border-b border-white/8 px-8 pt-8 pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label htmlFor="note-folder" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Folder
          </label>
          <select
            id="note-folder"
            value={note.folder_id ?? ""}
            onChange={handleFolderChange}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 outline-none transition-colors hover:border-white/20 focus:border-accent/50"
          >
            <option value="">Inbox</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <input
          ref={titleRef}
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full bg-transparent text-2xl font-extrabold tracking-tight text-white placeholder-zinc-700 outline-none"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/8 px-6 py-2">
        {/* Bold */}
        <ToolbarBtn label="Bold" title="Bold (Ctrl+B)" active={activeFormats.bold} onClick={() => exec("bold")}>
          <span className="font-black">B</span>
        </ToolbarBtn>

        {/* Italic */}
        <ToolbarBtn label="Italic" title="Italic (Ctrl+I)" active={activeFormats.italic} onClick={() => exec("italic")}>
          <span className="italic">I</span>
        </ToolbarBtn>

        {/* Underline */}
        <ToolbarBtn label="Underline" title="Underline (Ctrl+U)" active={activeFormats.underline} onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </ToolbarBtn>

        {/* Strikethrough */}
        <ToolbarBtn label="Strikethrough" title="Strikethrough" active={activeFormats.strikeThrough} onClick={() => exec("strikeThrough")}>
          <span className="line-through">S</span>
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-white/10" />

        {/* Bullet list */}
        <ToolbarBtn label="Bullet list" title="Bullet list" active={activeFormats.insertUnorderedList} onClick={() => exec("insertUnorderedList")}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="2" cy="4" r="1.2" fill="currentColor" />
            <circle cx="2" cy="8" r="1.2" fill="currentColor" />
            <circle cx="2" cy="12" r="1.2" fill="currentColor" />
            <path d="M5 4h8M5 8h8M5 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </ToolbarBtn>

        {/* Numbered list */}
        <ToolbarBtn label="Numbered list" title="Numbered list" active={activeFormats.insertOrderedList} onClick={() => exec("insertOrderedList")}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M1.5 3.5h1.5v5H1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 4h8M5 8h8M5 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-white/10" />

        {/* Link */}
        <ToolbarBtn label="Add link" title="Add link" active={showLinkInput} onClick={() => setShowLinkInput((v) => !v)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6.5 9.5a3.536 3.536 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9.5 6.5a3.536 3.536 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </ToolbarBtn>

        {/* Attachment */}
        <ToolbarBtn
          label="Attach file"
          title="Attach image or audio"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadingFile ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-t-transparent border-zinc-400" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.5 9.5v3a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 1.5v8M5.5 4l2.5-2.5L10.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </ToolbarBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="mx-1 h-5 w-px bg-white/10" />

        {/* Whisper record-and-transcribe */}
        <button
          type="button"
          aria-label="Record and transcribe with Whisper"
          title="Transcribe voice with Whisper AI"
          onMouseDown={(e) => {
            e.preventDefault();
            if (whisperState === "idle" || whisperState === "done" || whisperState === "error") {
              saveRange();
              startWhisperRecording();
            }
          }}
          disabled={whisperState === "transcribing"}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            whisperState === "recording"
              ? "text-red-400 hover:bg-red-500/15"
              : "text-zinc-400 hover:bg-white/8 hover:text-white disabled:opacity-40"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 8c0 .6.1 1.2.2 1.7M15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M5 8V6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 13v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M3 8c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mx-1 h-5 w-px bg-white/10" />

        {/* AI Summarize */}
        <button
          type="button"
          aria-label="AI Summarize"
          title="Summarize with AI"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSummarize();
          }}
          disabled={summarizing}
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/15 disabled:opacity-50"
        >
          {summarizing ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-t-transparent border-accent" />
          ) : (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          Summarize
        </button>

        <button
          type="button"
          aria-label="Chat about this note"
          title="Chat with AI about this note"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowChat((v) => !v);
          }}
          className={`flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors ${
            showChat
              ? "bg-accent/20 text-accent"
              : "text-zinc-400 hover:bg-white/8 hover:text-white"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4.5h12v7a1 1 0 0 1-1 1H6l-3 2v-2H3a1 1 0 0 1-1-1v-7Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 7h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Chat
        </button>
      </div>

      {/* ── Link input panel ── */}
      {showLinkInput && (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-white/[0.02] px-6 py-3">
          <input
            type="url"
            placeholder="https://…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-accent/50"
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            className="min-w-0 w-36 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-accent/50"
          />
          <button
            onClick={handleAddLink}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
          >
            Add
          </button>
          <button
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); setLinkLabel(""); }}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Whisper recording panel ── */}
      {whisperState !== "idle" && (
        <RecordingPanel
          state={whisperState}
          elapsed={recElapsed}
          onStop={stopWhisperRecording}
          onDismiss={dismissWhisperPanel}
        />
      )}

      {/* ── Summary error banner ── */}
      {summaryError && (        <div className="flex items-center justify-between border-b border-red-500/20 bg-red-500/10 px-6 py-2 text-xs text-red-400">
          <span>{summaryError}</span>
          <button onClick={() => setSummaryError(null)} className="ml-4 text-red-400 hover:text-red-300">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Editor + optional chat (one chat instance; stacks on small screens) ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="note-editor-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-3xl px-8 py-6">
            {/* Rich-text editor area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={refreshFormats}
              onMouseUp={() => { refreshFormats(); saveRange(); }}
              onFocus={refreshFormats}
              data-placeholder="Start writing…"
              className={[
                "prose-editor min-h-[280px] text-sm leading-relaxed text-zinc-200 outline-none",
                "empty:before:text-zinc-700 empty:before:content-[attr(data-placeholder)]",
              ].join(" ")}
            />

            {/* ── AI Summary panel ── */}
            {(showSummary || summarizing) && (
              <SummaryPanel
                summary={summary}
                onRegenerate={handleSummarize}
                onDismiss={() => { setShowSummary(false); setSummary(null); }}
                onInsert={handleInsertSummary}
                isLoading={summarizing}
              />
            )}

            {/* ── Links section ── */}
            {links.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Links
                </h3>
                <div className="space-y-2">
                  {links.map((link, i) => (
                    <LinkItem
                      key={i}
                      link={link}
                      onDelete={() => handleRemoveLink(i)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Attachments section ── */}
            {attachments.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Attachments
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {attachments.map((a) => (
                    <AttachmentCard
                      key={a.id}
                      attachment={a}
                      onDelete={() => handleDeleteAttachment(a)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <div className="flex h-[min(42vh,360px)] min-h-[220px] shrink-0 flex-col border-t border-white/8 md:h-auto md:min-h-0 md:w-[min(100%,380px)] md:border-l md:border-t-0">
            <NoteChatPanel
              key={note.id}
              noteId={note.id}
              noteTitle={localTitle}
              getEditorHtml={() => editorRef.current?.innerHTML ?? note.content ?? ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}
