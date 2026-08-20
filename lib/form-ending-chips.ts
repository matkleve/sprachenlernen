/**
 * Session-scoped ending chips for the build answer route. Contract:
 * docs/specs/service/form-practice.md (answer routes §)
 */

export const DEFAULT_ENDING_CHIP_CAP = 15;

/** Regular Spanish verb stem from infinitive — irregulars fall through to prefix match. */
export function spanishVerbStem(lemma: string): string {
  if (lemma.endsWith("ar") || lemma.endsWith("er") || lemma.endsWith("ir")) {
    return lemma.slice(0, -2);
  }
  return lemma;
}

export function endingFromSurface(surface: string, lemma: string): string {
  const regularStem = spanishVerbStem(lemma);
  if (regularStem.length > 0 && surface.startsWith(regularStem)) {
    return surface.slice(regularStem.length);
  }

  let shared = 0;
  while (shared < lemma.length && shared < surface.length && lemma[shared] === surface[shared]) {
    shared += 1;
  }
  if (shared > 0 && surface.length > shared) {
    return surface.slice(shared);
  }

  return surface;
}

export type EndingChipSource = {
  lemma: string;
  surfaces: readonly string[];
};

export function buildEndingChips(
  sources: readonly EndingChipSource[],
  cap: number = DEFAULT_ENDING_CHIP_CAP,
): string[] {
  const counts = new Map<string, number>();

  for (const source of sources) {
    for (const surface of source.surfaces) {
      const ending = endingFromSurface(surface, source.lemma);
      if (!ending) continue;
      counts.set(ending, (counts.get(ending) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, cap)
    .map(([ending]) => ending);
}
