/**
 * Tokenised readable text segments. Contract: docs/specs/feature/reading-surface.md
 */
import type { Lexicon, Resolution } from "@/lib/lexicon";

export type ReadableSegment =
  | { kind: "text"; value: string }
  | { kind: "word"; text: string; gloss: string | null };

function glossForResolution(
  resolution: Resolution,
  glossForLemma: (lemma: string) => string,
): string | null {
  if (resolution.kind === "unknown") return null;
  if (resolution.kind === "single") {
    const gloss = glossForLemma(resolution.analysis.lemma).trim();
    return gloss === "" ? null : gloss;
  }
  if (resolution.kind === "ambiguous") {
    for (const analysis of resolution.analyses) {
      const gloss = glossForLemma(analysis.lemma).trim();
      if (gloss !== "") return gloss;
    }
    return null;
  }
  return null;
}

export function segmentsForReadableText(
  text: string,
  lexicon: Lexicon,
  glossForLemma: (lemma: string) => string,
): ReadableSegment[] {
  const tokens = lexicon.tokenise(text);
  const segments: ReadableSegment[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      segments.push({ kind: "text", value: text.slice(cursor, token.start) });
    }
    const resolution = lexicon.resolve(token.text);
    segments.push({
      kind: "word",
      text: token.text,
      gloss: glossForResolution(resolution, glossForLemma),
    });
    cursor = token.end;
  }

  if (cursor < text.length) {
    segments.push({ kind: "text", value: text.slice(cursor) });
  }

  return segments;
}
