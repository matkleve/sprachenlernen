/**
 * Wall-clock read estimates for resolved material.
 * Contract: docs/specs/service/method-session-budget.resolved-material.md
 */

export const DEFAULT_READING_WPM = 200;

export function estimateReadingMinutes(
  tokenCount: number,
  wpm: number = DEFAULT_READING_WPM,
): number {
  if (tokenCount <= 0) return 1;
  return Math.max(1, Math.round(tokenCount / wpm));
}

export function formatReadingTimeLabel(tokenCount: number, wpm?: number): string {
  return `~${estimateReadingMinutes(tokenCount, wpm)} min`;
}
