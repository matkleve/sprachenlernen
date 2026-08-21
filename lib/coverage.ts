/**
 * Lemma-level coverage over learner Sources. Contract: docs/specs/service/coverage.md
 */
import type { LearnerWorldId } from "@/lib/learner-world";
import { isLearnerWorldId } from "@/lib/learner-world";
import type { SourceLicence } from "@/lib/content-ingestion";
import { validateSourceIngestion } from "@/lib/content-ingestion";
import type { LanguageProfile, Lexicon } from "@/lib/lexicon";

export const SOURCE_ORIGINS = ["catalogue", "fixture", "learner"] as const;
export type SourceOrigin = (typeof SOURCE_ORIGINS)[number];

export const SOURCE_KINDS = ["text", "audio"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export type ComfortBand = "demanding" | "comfortable" | "speed";

export type Source = {
  id: string;
  languageCode: string;
  kind: SourceKind;
  title: string;
  origin: SourceOrigin;
  body?: string;
  transcript?: string;
  tags?: string[];
  world?: LearnerWorldId;
  series?: string;
  episodeLabel?: string;
  sourceUrl?: string;
  addedAt: string;
  ephemeral?: boolean;
  licence?: SourceLicence;
};

export type CoverageResult = {
  coveragePercent: number;
  tokenCount: number;
  knownCount: number;
  comfortBand: ComfortBand;
};

export type WindowCoverage = {
  startToken: number;
  endToken: number;
  coveragePercent: number;
};

export type CoverageHistoryRow = {
  measuredAt: string;
  coveragePercent: number;
  calibrationDated: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sourceText = (source: Source): string => {
  if (source.kind === "text") return source.body ?? "";
  return source.transcript ?? "";
};

export const roundCoveragePercent = (known: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((known / total) * 1000) / 10;
};

export const comfortBandFor = (coveragePercent: number): ComfortBand => {
  if (coveragePercent < 95) return "demanding";
  if (coveragePercent <= 98) return "comfortable";
  return "speed";
};

const lemmasForResolution = (
  resolution: ReturnType<Lexicon["resolve"]>,
  lexicon: Lexicon,
): readonly string[] => {
  if (resolution.kind === "unknown") return [];
  if (resolution.kind === "single") return [resolution.analysis.lemma];
  if (resolution.kind === "ambiguous") return resolution.analyses.map((a) => a.lemma);
  return resolution.parts.flatMap((part) => lemmasForResolution(lexicon.resolve(part), lexicon));
};

export const isTokenKnown = (
  form: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): boolean => {
  const resolution = lexicon.resolve(form);
  if (resolution.kind === "unknown") return false;
  if (resolution.kind === "single") {
    return heldLemmas.has(resolution.analysis.lemma);
  }
  if (resolution.kind === "ambiguous") {
    return resolution.analyses.some((a) => heldLemmas.has(a.lemma));
  }
  // Fused: every part must be known (AC-6).
  return resolution.parts.every((part) => isTokenKnown(part, lexicon, heldLemmas));
};

export const computeCoverage = (
  text: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): CoverageResult => {
  const tokens = lexicon.tokenise(text);
  let knownCount = 0;
  for (const token of tokens) {
    if (isTokenKnown(token.text, lexicon, heldLemmas)) knownCount++;
  }
  const tokenCount = tokens.length;
  const coveragePercent = roundCoveragePercent(knownCount, tokenCount);
  return {
    coveragePercent,
    tokenCount,
    knownCount,
    comfortBand: comfortBandFor(coveragePercent),
  };
};

const DEFAULT_WINDOW_SEC = 60;
const DEFAULT_WORDS_PER_MINUTE = 150;

export const computeWindowCoverage = (
  text: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
  options?: { windowSec?: number; wordsPerMinute?: number },
): WindowCoverage[] => {
  const windowSec = options?.windowSec ?? DEFAULT_WINDOW_SEC;
  const wordsPerMinute = options?.wordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE;
  const windowSize = Math.max(1, Math.round((windowSec / 60) * wordsPerMinute));
  const tokens = lexicon.tokenise(text);
  const windows: WindowCoverage[] = [];

  if (tokens.length === 0) return windows;

  const lastStart = Math.max(0, tokens.length - windowSize);
  for (let start = 0; start <= lastStart; start++) {
    const end = Math.min(tokens.length, start + windowSize);
    const slice = tokens.slice(start, end);
    let known = 0;
    for (const token of slice) {
      if (isTokenKnown(token.text, lexicon, heldLemmas)) known++;
    }
    windows.push({
      startToken: start,
      endToken: end,
      coveragePercent: roundCoveragePercent(known, slice.length),
    });
  }

  windows.sort((a, b) => b.coveragePercent - a.coveragePercent);
  return windows;
};

export const buildLemmaSourceIndex = (
  sources: readonly Source[],
  lexicon: Lexicon,
): Map<string, string[]> => {
  const index = new Map<string, Set<string>>();

  for (const source of sources) {
    const text = sourceText(source);
    if (text.trim() === "") continue;

    const lemmasInSource = new Set<string>();
    for (const token of lexicon.tokenise(text)) {
      for (const lemma of lemmasForResolution(lexicon.resolve(token.text), lexicon)) {
        lemmasInSource.add(lemma);
      }
    }

    for (const lemma of lemmasInSource) {
      const bucket = index.get(lemma) ?? new Set<string>();
      bucket.add(source.id);
      index.set(lemma, bucket);
    }
  }

  return new Map([...index.entries()].map(([lemma, ids]) => [lemma, [...ids].sort()]));
};

export const sourcesForTopic = (
  sources: readonly Source[],
  topicId: string,
  lexicon: Lexicon,
  heldLemmas: ReadonlySet<string>,
): Array<{ source: Source; coverage: CoverageResult }> =>
  sources
    .filter((source) => source.tags?.includes(topicId))
    .map((source) => ({
      source,
      coverage: computeCoverage(sourceText(source), lexicon, heldLemmas),
    }))
    .sort((a, b) => b.coverage.coveragePercent - a.coverage.coveragePercent);

export const appendCoverageHistory = (
  history: readonly CoverageHistoryRow[],
  coveragePercent: number,
  profile: LanguageProfile,
  measuredAt: string = new Date().toISOString(),
): CoverageHistoryRow[] => [
  ...history,
  {
    measuredAt,
    coveragePercent,
    calibrationDated: profile.calibration?.dated ?? null,
  },
];

const validateSource = (input: unknown, index: number): { source?: Source; errors: string[] } => {
  const errors: string[] = [];
  const prefix = `sources[${index}]`;

  if (!isRecord(input)) return { errors: [`${prefix}: must be an object`] };

  for (const key of ["id", "languageCode", "title", "addedAt"] as const) {
    if (typeof input[key] !== "string" || input[key] === "") {
      errors.push(`${prefix}.${key}: required non-empty string`);
    }
  }

  if (!SOURCE_KINDS.includes(input.kind as SourceKind)) {
    errors.push(`${prefix}.kind: required — "text" or "audio"`);
  }

  if (!SOURCE_ORIGINS.includes(input.origin as SourceOrigin)) {
    errors.push(`${prefix}.origin: required — catalogue, fixture, or learner`);
  }

  const kind = input.kind as SourceKind;
  if (kind === "text" && (typeof input.body !== "string" || input.body === "")) {
    errors.push(`${prefix}.body: required for text sources`);
  }
  if (kind === "audio" && (typeof input.transcript !== "string" || input.transcript === "")) {
    errors.push(`${prefix}.transcript: required for audio sources`);
  }

  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags) || input.tags.some((t) => typeof t !== "string")) {
      errors.push(`${prefix}.tags: must be an array of strings`);
    }
  }

  if (input.world !== undefined) {
    if (typeof input.world !== "string" || !isLearnerWorldId(input.world)) {
      errors.push(`${prefix}.world: invalid learner world id`);
    }
  }

  const origin = input.origin as SourceOrigin;
  let licence: SourceLicence | undefined;
  if (input.licence !== undefined) {
    if (!isRecord(input.licence)) {
      errors.push(`${prefix}.licence: must be an object`);
    } else {
      const kind = input.licence.kind;
      if (typeof kind !== "string" || kind === "") {
        errors.push(`${prefix}.licence.kind: required non-empty string`);
      }
      if (typeof input.licence.fetchedAt !== "string" || input.licence.fetchedAt === "") {
        errors.push(`${prefix}.licence.fetchedAt: required non-empty string`);
      }
      if (errors.length === 0) {
        licence = input.licence as unknown as SourceLicence;
      }
    }
  }

  const ingestError = validateSourceIngestion({ origin, licence }, prefix);
  if (ingestError) errors.push(ingestError);

  if (errors.length) return { errors };

  return {
    source: {
      ...(input as unknown as Source),
      licence,
    },
    errors: [],
  };
};

export const loadSources = (input: unknown): { sources: Source[]; errors: string[] } => {
  if (!Array.isArray(input)) return { sources: [], errors: ["sources: must be an array"] };

  const sources: Source[] = [];
  const errors: string[] = [];

  for (const [index, entry] of input.entries()) {
    const result = validateSource(entry, index);
    errors.push(...result.errors);
    if (result.source) sources.push(result.source);
  }

  return { sources, errors };
};
