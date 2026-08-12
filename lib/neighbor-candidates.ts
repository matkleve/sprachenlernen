export type NeighborCandidateIndex = {
  language: string;
  rule: "levenshtein-1-length-3-8";
  tightened: boolean;
  candidates: Record<string, string[]>;
};

import {
  NEIGHBOR_MAX_DISTANCE as NEIGHBOR_MAX_DISTANCE_IMPL,
  NEIGHBOR_MAX_LENGTH as NEIGHBOR_MAX_LENGTH_IMPL,
  NEIGHBOR_MIN_LENGTH as NEIGHBOR_MIN_LENGTH_IMPL,
  NEIGHBOR_RATIO_TIGHTEN as NEIGHBOR_RATIO_TIGHTEN_IMPL,
  buildNeighborCandidateIndex as buildNeighborCandidateIndexImpl,
  candidateRatio as candidateRatioImpl,
  countLemmasWithCandidates as countLemmasWithCandidatesImpl,
  levenshteinDistance as levenshteinDistanceImpl,
  neighborCandidatesForLemma as neighborCandidatesForLemmaImpl,
} from "./neighbor-candidates.mjs";

export const NEIGHBOR_MIN_LENGTH = NEIGHBOR_MIN_LENGTH_IMPL;
export const NEIGHBOR_MAX_LENGTH = NEIGHBOR_MAX_LENGTH_IMPL;
export const NEIGHBOR_MAX_DISTANCE = NEIGHBOR_MAX_DISTANCE_IMPL;
export const NEIGHBOR_RATIO_TIGHTEN = NEIGHBOR_RATIO_TIGHTEN_IMPL;

export function levenshteinDistance(a: string, b: string): number {
  return levenshteinDistanceImpl(a, b);
}

export function neighborCandidatesForLemma(
  lemma: string,
  pool: readonly string[],
  options: { tightened: boolean },
): string[] {
  return neighborCandidatesForLemmaImpl(lemma, pool, options);
}

export function buildNeighborCandidateIndex(
  language: string,
  lemmas: readonly string[],
): NeighborCandidateIndex {
  return buildNeighborCandidateIndexImpl(language, lemmas) as NeighborCandidateIndex;
}

export function countLemmasWithCandidates(index: NeighborCandidateIndex): number {
  return countLemmasWithCandidatesImpl(index);
}

export function candidateRatio(index: NeighborCandidateIndex, poolSize: number): number {
  return candidateRatioImpl(index, poolSize);
}
