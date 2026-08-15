/**
 * Tracks which weekly reflection the learner has opened. Contract:
 * docs/specs/feature/weekly-reflection.md
 *
 * Cookie — not a profile column yet (spec open question). Scoped per ISO week
 * and learning language so switching languages does not clear the wrong mark.
 */

export const REFLECTION_SEEN_COOKIE = "sl-reflection-seen";

export function reflectionSeenValue(isoWeek: string, languageCode: string): string {
  return `${isoWeek}:${languageCode}`;
}

export function parseReflectionSeen(
  value: string | undefined,
): { isoWeek: string; languageCode: string } | null {
  if (!value) return null;
  const match = /^(\d{4}-W\d{2}):([a-z]{2})$/.exec(value);
  if (!match) return null;
  return { isoWeek: match[1]!, languageCode: match[2]! };
}

export function isReflectionUnread(
  isoWeek: string,
  languageCode: string,
  seenValue: string | undefined,
): boolean {
  return reflectionSeenValue(isoWeek, languageCode) !== seenValue;
}
