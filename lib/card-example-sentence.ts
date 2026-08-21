/**
 * Example sentence picker for review cards. Contract:
 * docs/specs/feature/card-example-sentence.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeCoverage,
  comfortBandFor,
  type CoverageResult,
} from "@/lib/coverage";
import {
  DEFAULT_LEARNER_WORLD_CONFIG,
  type LearnerWorldId,
} from "@/lib/learner-world";
import type { Lexicon } from "@/lib/lexicon";

export const MAX_EXAMPLE_SENTENCE_TOKENS = 20;

export type ExampleSentenceEntry = {
  id: string;
  text: string;
  translation: string;
  wordIds: string[];
  world?: LearnerWorldId;
};

export type ExampleSentenceBank = {
  sentences: ExampleSentenceEntry[];
};

export type ExampleSentencePick = {
  id: string;
  text: string;
  translation: string;
};

export type PickExampleSentenceInput = {
  bank: ExampleSentenceBank;
  wordId: string;
  heldLemmas: ReadonlySet<string>;
  lexicon: Lexicon;
  activeWorld: LearnerWorldId;
  salt: string;
};

const banks = new Map<string, ExampleSentenceBank>();

export function loadExampleSentenceBank(languageCode: string): ExampleSentenceBank | null {
  const cached = banks.get(languageCode);
  if (cached) return cached;

  const path = join(process.cwd(), "data/example-sentences", `${languageCode}.json`);
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as ExampleSentenceBank;
    if (!Array.isArray(raw.sentences) || raw.sentences.length === 0) return null;
    banks.set(languageCode, raw);
    return raw;
  } catch {
    return null;
  }
}

function stableFraction(salt: string): number {
  let hash = 0;
  for (let i = 0; i < salt.length; i += 1) {
    hash = (hash * 31 + salt.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 10_000) / 10_000;
}

function tokenCount(text: string, lexicon: Lexicon): number {
  return lexicon.tokenise(text).length;
}

function coverageScore(coverage: CoverageResult): { tier: number; distance: number } {
  if (coverage.comfortBand === "comfortable") {
    return { tier: 0, distance: Math.abs(coverage.coveragePercent - 96.5) };
  }
  return { tier: 1, distance: Math.abs(coverage.coveragePercent - 95) };
}

function compareCoverage(a: CoverageResult, b: CoverageResult): number {
  const scoreA = coverageScore(a);
  const scoreB = coverageScore(b);
  if (scoreA.tier !== scoreB.tier) return scoreA.tier - scoreB.tier;
  return scoreA.distance - scoreB.distance;
}

function worldWeight(entry: ExampleSentenceEntry, activeWorld: LearnerWorldId): number {
  if (activeWorld === "general") return 1;
  if (!entry.world) return 1;
  if (entry.world === activeWorld) return DEFAULT_LEARNER_WORLD_CONFIG.gammaMatch;
  return 1;
}

function weightedStablePick<T>(
  items: readonly T[],
  weights: readonly number[],
  salt: string,
): T | null {
  if (items.length === 0) return null;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return items[0] ?? null;

  let roll = stableFraction(salt) * total;
  for (let index = 0; index < items.length; index += 1) {
    roll -= weights[index] ?? 0;
    if (roll <= 0) return items[index] ?? null;
  }
  return items[items.length - 1] ?? null;
}

export function pickExampleSentence(input: PickExampleSentenceInput): ExampleSentencePick | null {
  const candidates = input.bank.sentences.filter((entry) => {
    if (!entry.wordIds.includes(input.wordId)) return false;
    return tokenCount(entry.text, input.lexicon) <= MAX_EXAMPLE_SENTENCE_TOKENS;
  });
  if (candidates.length === 0) return null;

  const scored = candidates.map((entry) => ({
    entry,
    coverage: computeCoverage(entry.text, input.lexicon, input.heldLemmas),
  }));

  scored.sort((a, b) => compareCoverage(a.coverage, b.coverage));
  const best = scored[0]?.coverage;
  if (!best) return null;

  const tier = coverageScore(best).tier;
  const ties = scored.filter((row) => coverageScore(row.coverage).tier === tier);
  const minDistance = coverageScore(best).distance;
  const closest = ties.filter((row) => coverageScore(row.coverage).distance === minDistance);

  const weights = closest.map((row) => worldWeight(row.entry, input.activeWorld));
  const chosen = weightedStablePick(
    closest.map((row) => row.entry),
    weights,
    input.salt,
  );
  if (!chosen) return null;

  return {
    id: chosen.id,
    text: chosen.text,
    translation: chosen.translation,
  };
}

/** Exported for tests — comfort band of a candidate sentence. */
export function exampleSentenceComfortBand(
  text: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): CoverageResult["comfortBand"] {
  return comfortBandFor(computeCoverage(text, lexicon, heldLemmas).coveragePercent);
}
