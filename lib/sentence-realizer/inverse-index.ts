import type { LemmaTable } from "@/lib/lemma-table";

/**
 * Build lemma|pos|cell → preferred surface form from a shipped lemma table.
 */
export function buildInverseFormIndex(table: LemmaTable): Map<string, string> {
  const index = new Map<string, string>();

  for (const [surface, analyses] of Object.entries(table.forms)) {
    for (const analysis of analyses) {
      if (!analysis.cell) continue;
      const key = `${analysis.lemma}|${analysis.pos}|${analysis.cell}`;
      const existing = index.get(key);
      if (!existing) {
        index.set(key, surface);
        continue;
      }
      if (shouldReplace(existing, surface, analysis)) {
        index.set(key, surface);
      }
    }
  }

  return index;
}

function shouldReplace(
  existing: string,
  candidate: string,
  analysis: { lemma: string; cell: string | null },
): boolean {
  if (existing === candidate) return false;
  if (analysis.cell === "inf") return false;
  // Prefer conjugated surfaces over the bare infinitive lemma string.
  if (existing === analysis.lemma && candidate !== analysis.lemma) return true;
  return false;
}

export function lookupForm(
  index: ReadonlyMap<string, string>,
  lemma: string,
  pos: string,
  cell: string,
): string | null {
  return index.get(`${lemma}|${pos}|${cell}`) ?? null;
}

export function buildLemmaGenderMap(table: LemmaTable): Map<string, "m" | "f"> {
  const genders = new Map<string, "m" | "f">();
  for (const [lemma, meta] of Object.entries(table.lemmas)) {
    const gender = meta.noun;
    if (gender === "m" || gender === "f") genders.set(lemma, gender);
  }
  return genders;
}
