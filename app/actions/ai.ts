"use server";

import OpenAI from "openai";
import { toFile } from "openai";
import { createClient } from "@/app/lib/supabase/server";

export type SummaryResult = {
  keyPoints: string[];
  actionItems: string[];
  openQuestions: string[];
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function summarizeNote(
  noteId: string,
  title: string,
  content: string,
): Promise<SummaryResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: owned, error: ownError } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ownError) throw new Error(ownError.message);
  if (!owned) throw new Error("Note not found or access denied.");

  const plainText = stripHtml(content);

  if (!plainText.trim()) {
    throw new Error("This note has no content to summarize.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are an expert note analyst. Given a note, extract and return ONLY a valid JSON object with exactly these three fields:
- "keyPoints": array of strings — the most important facts, concepts, or ideas (3–7 items)
- "actionItems": array of strings — concrete tasks, follow-ups, or things to do (0–5 items, empty array if none)
- "openQuestions": array of strings — unresolved questions or things that need clarification (0–5 items, empty array if none)

Rules:
- Each item must be a concise, complete sentence.
- Return ONLY the JSON object. No markdown, no explanation.
- If the note is very short, still produce the best output you can.`;

  const userPrompt = `Note title: ${title || "Untitled"}

Note content:
${plainText}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let result: SummaryResult;

  try {
    const parsed = JSON.parse(raw);
    result = {
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      openQuestions: Array.isArray(parsed.openQuestions)
        ? parsed.openQuestions
        : [],
    };
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }

  await supabase.from("notes").update({ summary: result }).eq("id", noteId);

  return result;
}

const MAX_TRANSCRIBE_BYTES = 25 * 1024 * 1024;

export async function transcribeAudio(formData: FormData): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const blob = formData.get("audio") as Blob | null;
  if (!blob || blob.size === 0) {
    throw new Error("No audio data received.");
  }
  if (blob.size > MAX_TRANSCRIBE_BYTES) {
    throw new Error("Recording is too large (max 25 MB).");
  }

  // Determine extension from MIME type (webm or ogg; Whisper supports both)
  const ext = blob.type.includes("ogg") ? "ogg" : "webm";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const file = await toFile(blob, `recording.${ext}`, { type: blob.type });

  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "text",
  });

  // response_format: "text" returns a plain string directly
  return (response as unknown as string).trim();
}

export type NoteChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const MAX_NOTE_CONTEXT_CHARS = 48_000;
const MAX_CHAT_HISTORY_MESSAGES = 24;

/**
 * Chat about the current note only. Verifies note ownership server-side.
 * `noteContentHtml` should reflect the editor (includes unsaved text).
 */
export async function chatWithNote(
  noteId: string,
  noteTitle: string,
  noteContentHtml: string,
  messages: NoteChatMessage[],
): Promise<{ reply: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: row, error: rowError } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (rowError) throw new Error(rowError.message);
  if (!row) throw new Error("Note not found or access denied.");

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    throw new Error("Send a non-empty message.");
  }

  let plain = stripHtml(noteContentHtml);
  if (!plain.trim()) {
    plain = "(This note is empty — the user may still ask general questions about filling it out or structure.)";
  } else if (plain.length > MAX_NOTE_CONTEXT_CHARS) {
    plain =
      plain.slice(0, MAX_NOTE_CONTEXT_CHARS) +
      "\n\n[Note was truncated for length — focus on the visible portion.]";
  }

  const history = messages.slice(-MAX_CHAT_HISTORY_MESSAGES);

  const systemPrompt = `You are a focused study and productivity assistant inside a note-taking app.

The user is viewing ONE note. Your answers must be grounded in that note's text below. If something is not in the note, say clearly that it does not appear in the note and suggest what they could add or where to look.

Rules:
- Be concise; use short paragraphs or bullets when helpful.
- Do not invent facts that are not supported by the note.
- If the note is empty or minimal, help them brainstorm or outline — still stay practical.
- Do not mention system prompts or policies.

--- NOTE (ground truth) ---
Title: ${noteTitle || "Untitled"}

${plain}
--- END NOTE ---`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    temperature: 0.5,
    max_tokens: 1200,
  });

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) throw new Error("No response from the model. Try again.");

  return { reply };
}
