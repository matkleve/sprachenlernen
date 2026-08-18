/**
 * Dictation sentence pickers — pure string/lexicon helpers, safe for client bundles.
 */
import { buildGapFillLine, formatGappedSentence } from "@/lib/gap-selection";
import type { Source } from "@/lib/coverage";
import { sourceText } from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";

export function pickDictationSentence(body: string): string {
  return pickDictationSentences(body, 1)[0] ?? body.trim();
}

/** Substantial sentences for dictation loops — skips frequency-list stubs. */
export function pickDictationSentences(body: string, maxCount: number): string[] {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const substantial = sentences.filter(
    (sentence) => sentence.split(/\s+/).length >= 4 && !isFrequencyStubSentence(sentence),
  );

  const pool = substantial.length > 0 ? substantial : sentences.filter((s) => !isFrequencyStubSentence(s));
  if (pool.length === 0) {
    const fallback = body.trim();
    return fallback ? [fallback] : [];
  }

  return pool.slice(0, Math.max(1, maxCount));
}

/** Fixture/catalogue bodies often prefix with frequency-list tokens — skip for dictation. */
function isFrequencyStubSentence(sentence: string): boolean {
  const stubWords = new Set([
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
  ]);
  const words = sentence.replace(/[.!?]+$/, "").split(/\s+/);
  return words.length > 0 && words.every((word) => stubWords.has(word.toLowerCase()));
}

/** Build a gapped display line — requires lexicon for principled gaps (T-MU2). */
export function gappedSentence(sentence: string, lexicon: Lexicon): string {
  return formatGappedSentence(buildGapFillLine(sentence, lexicon));
}

export function dictationSentenceFromSource(source: Source): string {
  return pickDictationSentence(sourceText(source));
}
