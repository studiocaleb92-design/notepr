"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { chatWithNote, type NoteChatMessage } from "@/app/actions/ai";

type Props = {
  noteId: string;
  noteTitle: string;
  getEditorHtml: () => string;
};

export default function NoteChatPanel({ noteId, noteTitle, getEditorHtml }: Props) {
  const [messages, setMessages] = useState<NoteChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function sendMessage() {
    const text = input.trim();
    if (!text || isPending) return;

    const userMsg: NoteChatMessage = { role: "user", content: text };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput("");
    setError(null);

    const html = getEditorHtml();

    startTransition(async () => {
      try {
        const { reply } = await chatWithNote(noteId, noteTitle, html, nextThread);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        setError((err as Error).message);
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-soft/80 md:border-l md:border-white/8">
      <div className="border-b border-white/8 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Chat about this note</h2>
        <p className="mt-1 text-[11px] leading-snug text-zinc-500">
          Answers use your note as context (including unsaved text in the editor).
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && !isPending && (
          <p className="px-1 text-xs text-zinc-600">
            Ask questions, get clarifications, or brainstorm next steps based on this note.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === "user"
                ? "ml-4 bg-accent/15 text-zinc-100"
                : "mr-2 border border-white/8 bg-white/[0.04] text-zinc-300"
            }`}
          >
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              {m.role === "user" ? "You" : "Assistant"}
            </span>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isPending && (
          <div className="mr-2 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs text-zinc-500">
            <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-3 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="border-t border-white/8 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message…"
            rows={2}
            disabled={isPending}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-accent/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="self-end rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-[10px] text-zinc-600">Enter to send · Shift+Enter for new line</p>
      </form>
    </div>
  );
}
