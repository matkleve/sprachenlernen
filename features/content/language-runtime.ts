/**
 * Shipped language data for content surfaces. Contract:
 * docs/specs/feature/content-traceability.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadSources, type Source } from "@/lib/coverage";
import { SHIPPED_CONTENT_LANGUAGES } from "@/lib/shipped-language";

export { loadLexiconForLanguage, SHIPPED_CONTENT_LANGUAGES } from "@/lib/shipped-language";

export function loadPersistedSources(languageCode: string): Source[] {
  if (
    !SHIPPED_CONTENT_LANGUAGES.includes(
      languageCode as (typeof SHIPPED_CONTENT_LANGUAGES)[number],
    )
  ) {
    return [];
  }

  const root = process.cwd();
  try {
    const raw = JSON.parse(readFileSync(join(root, `data/content/${languageCode}.json`), "utf8"));
    const { sources, errors } = loadSources(raw);
    if (errors.length > 0) return [];
    return sources.filter((source) => !source.ephemeral);
  } catch {
    return [];
  }
}
