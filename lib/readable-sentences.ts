/**
 * Sentence blocks for tap-to-gloss reading. Contract:
 * docs/specs/feature/reading-surface.md (T-W10 remainder)
 */
import type { Lexicon } from "@/lib/lexicon";
import { segmentsForReadableText, type ReadableSegment } from "@/lib/readable-text";

export type ReadableSentenceBlock = {
  segments: readonly ReadableSegment[];
};

/** Split prose into sentence-sized spans for second-tap gloss hints. */
export function splitSentenceSpans(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/(?<=[.!?…])\s+/u).map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
}

export function sentenceBlocksForText(
  text: string,
  lexicon: Lexicon,
  glossForLemma: (lemma: string) => string,
): ReadableSentenceBlock[] {
  return splitSentenceSpans(text).map((sentence) => ({
    segments: segmentsForReadableText(sentence, lexicon, glossForLemma),
  }));
}

/**
 * Rough gloss line from known word glosses — not a full sentence translation.
 * UC-007 v1 until sentence-level app_texts exist for arbitrary catalogue bodies.
 */
export function glossLineForSegments(segments: readonly ReadableSegment[]): string | null {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const segment of segments) {
    if (segment.kind !== "word" || !segment.gloss?.trim()) continue;
    const gloss = segment.gloss.trim();
    const key = gloss.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(gloss);
  }

  return ordered.length > 0 ? ordered.join(" · ") : null;
}
