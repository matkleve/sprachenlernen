/**
 * Ephemeral gap-set priority for the next review session.
 * Contract: docs/specs/feature/content-gap.md
 */
export const GAP_SET_COOKIE = "content-gap-set";

export type GapSetCookie = {
  sourceId: string;
  lemmas: string[];
};

export const parseGapSetCookie = (value: string | undefined): GapSetCookie | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const row = parsed as Record<string, unknown>;
    if (typeof row.sourceId !== "string" || row.sourceId === "") return null;
    if (!Array.isArray(row.lemmas) || row.lemmas.some((lemma) => typeof lemma !== "string")) {
      return null;
    }
    return { sourceId: row.sourceId, lemmas: row.lemmas };
  } catch {
    return null;
  }
};
