/**
 * Session slice of a Source. Contract: docs/specs/service/material-unit.md
 */
import {
  computeWindowCoverage,
  sourceText,
  type Source,
} from "@/lib/coverage";
import {
  dictationSentenceFromSource,
  pickDictationSentence,
} from "@/lib/dictation-sentence";
import type { Lexicon } from "@/lib/lexicon";

export const MATERIAL_UNIT_IDS = ["sentence", "paragraph", "window", "full"] as const;

export type MaterialUnitId = (typeof MATERIAL_UNIT_IDS)[number];

export const DEFAULT_WINDOW_DURATION_SEC = 300;

export const PARAGRAPH_TOKEN_CAP = 120;

export type ResolvedMaterialUnit = {
  unitId: MaterialUnitId;
  text: string;
  durationSec?: number;
  startToken?: number;
  endToken?: number;
  sentenceCount?: number;
};

export type ResolveMaterialUnitOptions = {
  durationSec?: number;
  lexicon?: Lexicon;
  heldLemmas?: ReadonlySet<string>;
};

export function resolveMaterialUnit(
  source: Source,
  unitId: MaterialUnitId,
  options?: ResolveMaterialUnitOptions,
): ResolvedMaterialUnit {
  const text = sourceText(source);

  switch (unitId) {
    case "sentence": {
      const sentence = dictationSentenceFromSource(source);
      return { unitId, text: sentence, sentenceCount: 1 };
    }
    case "paragraph": {
      const paragraph = pickParagraph(text);
      return {
        unitId,
        text: paragraph,
        sentenceCount: countSentences(paragraph),
      };
    }
    case "window": {
      const durationSec = clampWindowDuration(options?.durationSec);
      const windowText = pickWindowText(text, durationSec, options);
      return {
        unitId,
        text: windowText.text,
        durationSec,
        startToken: windowText.startToken,
        endToken: windowText.endToken,
        sentenceCount: countSentences(windowText.text),
      };
    }
    case "full":
      return {
        unitId,
        text,
        sentenceCount: countSentences(text),
      };
    default:
      throw new Error(`Unknown material unit: ${unitId satisfies never}`);
  }
}

function clampWindowDuration(durationSec?: number): number {
  if (durationSec === undefined) return DEFAULT_WINDOW_DURATION_SEC;
  return Math.min(600, Math.max(60, durationSec));
}

function pickParagraph(text: string): string {
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 0) return blocks[0] ?? "";

  const words = text.trim().split(/\s+/);
  if (words.length <= PARAGRAPH_TOKEN_CAP) return text.trim();
  return words.slice(0, PARAGRAPH_TOKEN_CAP).join(" ");
}

function pickWindowText(
  text: string,
  durationSec: number,
  options?: ResolveMaterialUnitOptions,
): { text: string; startToken?: number; endToken?: number } {
  const lexicon = options?.lexicon;
  const held = options?.heldLemmas ?? new Set<string>();

  if (lexicon) {
    const windows = computeWindowCoverage(text, lexicon, held, { windowSec: durationSec });
    const best = windows[0];
    if (best) {
      const tokens = lexicon.tokenise(text);
      const slice = tokens.slice(best.startToken, best.endToken);
      return {
        text: slice.map((token) => token.text).join(" "),
        startToken: best.startToken,
        endToken: best.endToken,
      };
    }
  }

  const words = text.trim().split(/\s+/);
  const windowWords = Math.max(1, Math.round((durationSec / 60) * 150));
  return { text: words.slice(0, windowWords).join(" ") };
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

const DEFAULT_CHUNK_SEC = 300;
const WORDS_PER_MINUTE = 150;

export type SequentialReadWindow = {
  text: string;
  durationSec: number;
  sentenceCount: number;
  startToken?: number;
  endToken?: number;
};

/**
 * Split a body into sequential non-overlapping read windows that fill
 * `totalDurationSec`. Reuses the best-coverage window picker per chunk when a
 * lexicon is available.
 */
export function resolveSequentialReadWindows(
  text: string,
  totalDurationSec: number,
  options?: {
    lexicon?: Lexicon;
    heldLemmas?: ReadonlySet<string>;
    chunkSec?: number;
  },
): SequentialReadWindow[] {
  const chunkSec = Math.min(600, Math.max(60, options?.chunkSec ?? DEFAULT_CHUNK_SEC));
  const lexicon = options?.lexicon;
  const held = options?.heldLemmas ?? new Set<string>();
  const tokens = lexicon ? lexicon.tokenise(text) : null;
  const totalTokens = tokens?.length ?? 0;

  if (totalDurationSec <= 0 || text.trim() === "") {
    return [];
  }

  const chunks: SequentialReadWindow[] = [];
  let remainingSec = totalDurationSec;
  let cursorToken = 0;

  while (remainingSec > 0 && (tokens === null || cursorToken < totalTokens)) {
    const thisSec = Math.min(chunkSec, remainingSec);
    const windowWords = Math.max(1, Math.round((thisSec / 60) * WORDS_PER_MINUTE));

    if (tokens && lexicon) {
      const sliceText = tokens
        .slice(cursorToken)
        .map((token) => token.text)
        .join(" ");
      if (!sliceText.trim()) break;

      const windows = computeWindowCoverage(sliceText, lexicon, held, { windowSec: thisSec });
      const best = windows[0];
      if (!best) break;

      const absoluteStart = cursorToken + best.startToken;
      const absoluteEnd = cursorToken + best.endToken;
      const slice = tokens.slice(absoluteStart, absoluteEnd);
      const chunkText = slice.map((token) => token.text).join(" ");
      if (!chunkText.trim()) break;

      chunks.push({
        text: chunkText,
        durationSec: thisSec,
        sentenceCount: countSentences(chunkText),
        startToken: absoluteStart,
        endToken: absoluteEnd,
      });

      if (absoluteEnd >= totalTokens) break;
      cursorToken = absoluteEnd;
    } else {
      const words = text.trim().split(/\s+/);
      const slice = words.slice(cursorToken, cursorToken + windowWords);
      if (slice.length === 0) break;
      const chunkText = slice.join(" ");
      chunks.push({
        text: chunkText,
        durationSec: thisSec,
        sentenceCount: countSentences(chunkText),
      });
      cursorToken += slice.length;
      if (cursorToken >= words.length) break;
    }

    remainingSec -= thisSec;
  }

  if (chunks.length === 0) {
    return [
      {
        text: text.trim(),
        durationSec: totalDurationSec,
        sentenceCount: countSentences(text),
      },
    ];
  }

  if (chunks.length === 1) {
    const single = chunks[0]!;
    single.durationSec = totalDurationSec;
    return chunks;
  }

  const usedSec = chunks.reduce((sum, chunk) => sum + chunk.durationSec, 0);
  if (usedSec < totalDurationSec) {
    const last = chunks[chunks.length - 1];
    if (last) last.durationSec += totalDurationSec - usedSec;
  }

  return chunks;
}

/** Re-export sentence picker for tests and recipe builders. */
export { pickDictationSentence };
