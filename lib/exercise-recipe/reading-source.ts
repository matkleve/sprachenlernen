import { resolveContentSourceById } from "@/lib/content-source-resolve";
import { DEFAULT_EXTENSIVE_READING_SOURCE_ID } from "@/lib/content-source-constants";
import type { SessionContext } from "@/lib/exercise-recipe/types";
import { computeCoverage, type Source } from "@/lib/coverage";
import { resolveMaterialUnit, type MaterialUnitId } from "@/lib/material-unit";
import { loadLexiconForLanguage } from "@/lib/shipped-language";

export type ReadingMaterialBundle = {
  source: Source;
  unitId: MaterialUnitId;
  text: string;
  coveragePercent: number;
  comfortBand: "demanding" | "comfortable" | "speed";
  tokenCount: number;
};

export function readingUnitId(ctx: SessionContext): MaterialUnitId {
  return ctx.unitId ?? "paragraph";
}

export function resolveReadingMaterial(
  source: Source,
  ctx: SessionContext,
): ReadingMaterialBundle {
  const lexicon = loadLexiconForLanguage(source.languageCode);
  const unitId = readingUnitId(ctx);
  const unit = resolveMaterialUnit(source, unitId, {
    durationSec: ctx.durationSec,
    lexicon: lexicon ?? undefined,
    heldLemmas: ctx.heldLemmas,
  });
  const coverage = lexicon
    ? computeCoverage(unit.text, lexicon, ctx.heldLemmas ?? new Set())
    : {
        coveragePercent: 0,
        tokenCount: 0,
        knownCount: 0,
        comfortBand: "demanding" as const,
      };

  return {
    source,
    unitId,
    text: unit.text,
    coveragePercent: coverage.coveragePercent,
    comfortBand: coverage.comfortBand,
    tokenCount: coverage.tokenCount,
  };
}

export async function resolveDefaultReadingSource(
  ctx: SessionContext,
  findSource: (id: string) => Promise<Source | null> | Source | null = resolveContentSourceById,
): Promise<ReadingMaterialBundle | null> {
  const resolvedId = ctx.sourceId ?? DEFAULT_EXTENSIVE_READING_SOURCE_ID;
  const source = await findSource(resolvedId);
  if (!source) return null;
  return resolveReadingMaterial(source, ctx);
}

/** Split text into N chunks for narrow-reading v1 (same source, labelled passes). */
export function splitTextForNarrowReading(text: string, parts: number): string[] {
  const sentences = text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= parts) {
    const chunkSize = Math.ceil(sentences.length / parts);
    return Array.from({ length: parts }, (_, index) =>
      sentences.slice(index * chunkSize, (index + 1) * chunkSize).join(" "),
    ).filter(Boolean);
  }

  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length >= parts) return blocks.slice(0, parts);

  const trimmed = text.trim();
  return Array.from({ length: parts }, () => trimmed);
}
