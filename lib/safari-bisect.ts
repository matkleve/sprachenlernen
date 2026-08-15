/**
 * Safari / PWA body bisect — study/31. Temporary until root cause is found.
 */

export const WORDS_BISECT_MAX_LEVEL = 5;
export const PROGRESS_BISECT_MAX_LEVEL = 5;

export const wordsBisectLevelLabels = [
  "Intro only (Methods-shaped minimal body)",
  "+ Review CTA card",
  "+ Vocabulary counts (held / fragile / new)",
  "+ Frequency blocks grid",
  "+ Review horizon field",
  "+ Vocabulary orbit chart (full Words body)",
] as const;

export const progressBisectLevelLabels = [
  "Intro only (Methods-shaped minimal body)",
  "+ Weekly reflection entry row",
  "+ Skills table",
  "+ Signals section + table",
  "+ Dose bands table",
  "+ Gap section (full Progress body)",
] as const;

export function parseBisectLevel(
  raw: string | string[] | undefined,
  maxLevel: number,
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "0", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, maxLevel);
}

export function bisectLevelHref(basePath: string, level: number): string {
  return `${basePath}?level=${level}`;
}
