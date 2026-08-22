/**
 * Paradigm cell groups for Progress form-mastery breakdown (T-W5).
 * Contract: docs/specs/service/form-mastery-signal.md, UC-062
 */
import esLemma from "@/data/lemma/es.json";
import itLemma from "@/data/lemma/it.json";
import { loadLemmaTable } from "@/lib/lemma-table";
import { paradigmCellLabel } from "@/lib/paradigm-cells";

const LEMMA_TABLES = {
  es: loadLemmaTable(esLemma, "es").table,
  it: loadLemmaTable(itLemma, "it").table,
} as const;

const IRREGULAR_LEMMAS: Record<string, ReadonlySet<string>> = {
  es: new Set([
    "ser",
    "estar",
    "ir",
    "haber",
    "hacer",
    "decir",
    "poder",
    "poner",
    "querer",
    "saber",
    "tener",
    "venir",
    "dar",
    "ver",
  ]),
  it: new Set([
    "essere",
    "avere",
    "fare",
    "andare",
    "dire",
    "dare",
    "stare",
    "volere",
    "potere",
    "dovere",
    "sapere",
    "venire",
    "uscire",
  ]),
};

const PERSON_SUFFIXES = new Set(["1sg", "2sg", "3sg", "1pl", "2pl", "3pl"]);

function conjugationClass(languageCode: string, lemma: string): string | undefined {
  const table = LEMMA_TABLES[languageCode as keyof typeof LEMMA_TABLES];
  const entry = table?.lemmas[lemma];
  return entry && typeof entry.verb === "string" ? entry.verb : undefined;
}

/**
 * Stable group key for one form-recall card — verb class + tense, or nominal shape.
 */
export function formCellGroupKey(languageCode: string, lemma: string, paradigmCell: string): string {
  const segments = paradigmCell.split(".");
  const last = segments[segments.length - 1] ?? "";
  const isFinite = PERSON_SUFFIXES.has(last);

  if (isFinite) {
    const tense = segments.slice(0, -1).join(".");
    if (IRREGULAR_LEMMAS[languageCode]?.has(lemma)) return `irregular-${tense}`;
    const conj = conjugationClass(languageCode, lemma);
    if (conj) return `verb-${conj}-${tense}`;
    return `finite-${tense}`;
  }

  const label = paradigmCellLabel(paradigmCell);
  if (label) return `nominal-${paradigmCell}`;
  return `other-${paradigmCell}`;
}

const TENSE_SHORT: Record<string, string> = {
  "ind.pres": "present",
  "ind.impf": "imperfect",
  "ind.pret": "preterite",
  "ind.fut": "future",
  "sub.pres": "present subjunctive",
  cond: "conditional",
  imp: "imperative",
};

const CONJ_SHORT_ES: Record<string, string> = {
  "1": "-ar",
  "2": "-er",
  "3": "-ir",
};

const CONJ_SHORT_IT: Record<string, string> = {
  "1": "-are",
  "2": "-ere",
  "3": "-ire",
};

/** English fallback when no locale string exists yet. */
export function formCellGroupShortLabel(languageCode: string, groupKey: string): string {
  if (groupKey.startsWith("verb-")) {
    const [, conj, ...tenseParts] = groupKey.split("-");
    const tense = tenseParts.join("-");
    const conjMap = languageCode === "it" ? CONJ_SHORT_IT : CONJ_SHORT_ES;
    const ending = conj ? conjMap[conj] ?? conj : "";
    const tenseLabel = TENSE_SHORT[tense] ?? tense.replace(/\./g, " ");
    return ending ? `${ending} · ${tenseLabel}` : tenseLabel;
  }
  if (groupKey.startsWith("irregular-")) {
    const tense = groupKey.slice("irregular-".length);
    const tenseLabel = TENSE_SHORT[tense] ?? tense.replace(/\./g, " ");
    return `irregular · ${tenseLabel}`;
  }
  if (groupKey.startsWith("nominal-")) {
    const cell = groupKey.slice("nominal-".length);
    const label = paradigmCellLabel(cell);
    return label?.form ?? cell;
  }
  if (groupKey.startsWith("finite-")) {
    const tense = groupKey.slice("finite-".length);
    return TENSE_SHORT[tense] ?? tense.replace(/\./g, " ");
  }
  return groupKey;
}

/** next-intl key under `formCellGroups.<language>.<groupKey>`. */
export function formCellGroupLabelKey(languageCode: string, groupKey: string): string {
  return `formCellGroups.${languageCode}.${groupKey}`;
}
