/**
 * Load catalogue sources from `data/content/` for server-side recipe builders.
 * Contract: docs/specs/service/coverage.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadSources, sourceText, type Source } from "@/lib/coverage";
import { buildGapFillLine, formatGappedSentence } from "@/lib/gap-selection";
import type { Lexicon } from "@/lib/lexicon";

export const CONTENT_SOURCE_LANGUAGES = ["es", "it"] as const;

/** Default catalogue source for partial dictation when no `sourceId` is passed. */
export const DEFAULT_PARTIAL_DICTATION_SOURCE_ID = "es-fixture-cafe";

export function loadContentSources(languageCode: string): Source[] {
  if (
    !CONTENT_SOURCE_LANGUAGES.includes(
      languageCode as (typeof CONTENT_SOURCE_LANGUAGES)[number],
    )
  ) {
    return [];
  }

  const root = process.cwd();
  try {
    const raw = JSON.parse(
      readFileSync(join(root, `data/content/${languageCode}.json`), "utf8"),
    );
    const { sources, errors } = loadSources(raw);
    if (errors.length > 0) return [];
    return sources.filter((source) => !source.ephemeral);
  } catch {
    return [];
  }
}

export function findContentSourceById(sourceId: string): Source | null {
  for (const languageCode of CONTENT_SOURCE_LANGUAGES) {
    const match = loadContentSources(languageCode).find(
      (source) => source.id === sourceId,
    );
    if (match) return match;
  }
  return null;
}

export function pickDictationSentence(body: string): string {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const substantial = sentences.filter(
    (sentence) => sentence.split(/\s+/).length >= 4 && !isFrequencyStubSentence(sentence),
  );

  return substantial[0] ?? sentences.find((s) => !isFrequencyStubSentence(s)) ?? sentences[0] ?? body.trim();
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
