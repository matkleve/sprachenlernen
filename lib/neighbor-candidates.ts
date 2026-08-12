/**
 * Tier-1 neighbour-word collision candidates. Contract:
 * docs/specs/service/broken-card-detection.md, ADR-0012 decision 15.
 *
 * Framework-free — safe for build scripts and tests.
 */

export const NEIGHBOR_MIN_LENGTH = 3;
export const NEIGHBOR_MAX_LENGTH = 8;
export const NEIGHBOR_MAX_DISTANCE = 1;
/** When more than this share of lemmas have a candidate, apply the tightened rule. */
export const NEIGHBOR_RATIO_TIGHTEN = 0.03;

export type NeighborCandidateIndex = {
  language: string;
  rule: "levenshtein-1-length-3-8";
  tightened: boolean;
  candidates: Record<string, string[]>;
};

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[] = new Array(rows * cols);

  for (let i = 0; i < rows; i++) matrix[i * cols] = i;
  for (let j = 0; j < cols; j++) matrix[j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const idx = i * cols + j;
      const up = matrix[(i - 1) * cols + j] ?? 0;
      const left = matrix[i * cols + (j - 1)] ?? 0;
      const diag = matrix[(i - 1) * cols + (j - 1)] ?? 0;
      matrix[idx] = Math.min(up + 1, left + 1, diag + cost);
    }
  }

  return matrix[(rows - 1) * cols + (cols - 1)]!;
}

function inLengthWindow(lemma: string): boolean {
  return lemma.length >= NEIGHBOR_MIN_LENGTH && lemma.length <= NEIGHBOR_MAX_LENGTH;
}

function sharesFirstTwoCharacters(a: string, b: string): boolean {
  if (a.length < 2 || b.length < 2) return false;
  return a.slice(0, 2) === b.slice(0, 2);
}

export function neighborCandidatesForLemma(
  lemma: string,
  pool: readonly string[],
  options: { tightened: boolean },
): string[] {
  if (!inLengthWindow(lemma)) return [];

  const matches: string[] = [];
  for (const other of pool) {
    if (other === lemma || !inLengthWindow(other)) continue;
    if (levenshteinDistance(lemma, other) !== NEIGHBOR_MAX_DISTANCE) continue;
    if (options.tightened && !sharesFirstTwoCharacters(lemma, other)) continue;
    matches.push(other);
  }

  return matches.sort((a, b) => a.localeCompare(b));
}

export function buildNeighborCandidateIndex(
  language: string,
  lemmas: readonly string[],
): NeighborCandidateIndex {
  const unique = [...new Set(lemmas)].sort((a, b) => a.localeCompare(b));
  const loose = new Map<string, string[]>();
  let withCandidates = 0;

  for (const lemma of unique) {
    const candidates = neighborCandidatesForLemma(lemma, unique, { tightened: false });
    if (candidates.length > 0) withCandidates += 1;
    loose.set(lemma, candidates);
  }

  const ratio = unique.length === 0 ? 0 : withCandidates / unique.length;
  const tightened = ratio > NEIGHBOR_RATIO_TIGHTEN;

  const candidates: Record<string, string[]> = {};
  for (const lemma of unique) {
    const list = tightened
      ? neighborCandidatesForLemma(lemma, unique, { tightened: true })
      : (loose.get(lemma) ?? []);
    if (list.length > 0) {
      candidates[`${language}:${lemma}`] = list;
    }
  }

  return {
    language,
    rule: "levenshtein-1-length-3-8",
    tightened,
    candidates,
  };
}

export function countLemmasWithCandidates(index: NeighborCandidateIndex, poolSize: number): number {
  return Object.keys(index.candidates).length;
}

export function candidateRatio(index: NeighborCandidateIndex, poolSize: number): number {
  if (poolSize === 0) return 0;
  return countLemmasWithCandidates(index, poolSize) / poolSize;
}
