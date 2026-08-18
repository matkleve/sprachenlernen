import type { Entry } from "@/lib/method-catalogue";

type LocalizableFields = Pick<Entry, "name" | "summary" | "trains" | "doesNotDo">;

const FIELDS = ["name", "summary", "trains", "doesNotDo"] as const satisfies readonly (keyof LocalizableFields)[];

/**
 * Resolve one catalogue field for the active locale.
 * Falls back to the English catalogue string when no translation exists.
 */
export function resolveMethodField(
  id: string,
  field: keyof LocalizableFields,
  fallback: string,
  translate: (key: string) => string,
): string {
  const key = `entries.${id}.${field}`;
  try {
    const value = translate(key);
    return value === key ? fallback : value;
  } catch {
    return fallback;
  }
}

/** Localize the four learner-facing prose fields on a catalogue entry. */
export function localizeMethodEntry<T extends Entry>(
  entry: T,
  translate: (key: string) => string,
): T {
  const localized = { ...entry } as T;
  for (const field of FIELDS) {
    (localized as LocalizableFields)[field] = resolveMethodField(
      entry.id,
      field,
      entry[field],
      translate,
    );
  }
  return localized;
}

/** Build id → localized name map for drill-in shell titles. */
export function localizeMethodTitles(
  entries: readonly Entry[],
  translate: (key: string) => string,
): Record<string, string> {
  return Object.fromEntries(
    entries.map((entry) => [entry.id, resolveMethodField(entry.id, "name", entry.name, translate)]),
  );
}
