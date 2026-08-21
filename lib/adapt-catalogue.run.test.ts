/**
 * Nightly catalogue adaptation batch — pre-warm T2 cache per level band.
 * Contract: docs/specs/service/content-adaptation.md (T-CI3)
 *
 * Run: RUN_ADAPT_CATALOGUE=1 npm run adapt:catalogue
 * Optional: ADAPTATION_LANGUAGE=es ADAPTATION_REWRITE=fixture
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createFileAdaptationCache } from "@/lib/adaptation-cache";
import { createAdaptationRewrite, rewriteWithFixture } from "@/lib/adaptation-rewrite";
import { adaptCatalogueSource } from "@/lib/catalogue-adaptation";
import { loadSources } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";
import { CATALOGUE_ADAPTATION_LEVELS } from "@/lib/target-level";

const ROOT = join(import.meta.dirname, "..");
const shouldRun = process.env.RUN_ADAPT_CATALOGUE === "1";

const loadEsLexicon = () => {
  const profileResult = loadProfile(
    JSON.parse(readFileSync(join(ROOT, "data/languages/es.json"), "utf8")),
  );
  if (!profileResult.profile) throw new Error("Failed to load es profile");

  const frequency = parseFrequencyList(readFileSync(join(ROOT, "data/frequency/es.txt"), "utf8"));
  const table = loadLemmaTable(
    JSON.parse(readFileSync(join(ROOT, "data/lemma/es.json"), "utf8")),
    "es",
  ).table;
  if (!table) throw new Error("Failed to load es lemma table");

  return {
    lexicon: buildLexicon(profileResult.profile, frequency, table),
    heldLemmas: new Set(Object.keys(table.lemmas).slice(0, 800)),
  };
};

const rewriteForBatch = process.env.ADAPTATION_REWRITE === "openai"
  ? createAdaptationRewrite()
  : rewriteWithFixture;

describe.runIf(shouldRun)("adapt-catalogue batch", () => {
  it("pre-warms T2 cache for catalogue sources", async () => {
    const language = process.env.ADAPTATION_LANGUAGE ?? "es";
    const cache = createFileAdaptationCache(join(ROOT, "data/adaptations"));
    const { lexicon, heldLemmas } = loadEsLexicon();

    let adapted = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of readdirSync(join(ROOT, "data/content")).filter((name) =>
      name.endsWith(".json"),
    )) {
      const lang = file.replace(/\.json$/, "");
      if (lang !== language) continue;

      const rows = JSON.parse(readFileSync(join(ROOT, "data/content", file), "utf8"));
      const { sources, errors } = loadSources(rows);
      expect(errors).toEqual([]);

      for (const source of sources) {
        if (source.origin !== "catalogue") continue;
        for (const targetLevel of CATALOGUE_ADAPTATION_LEVELS) {
          const result = await adaptCatalogueSource({
            source,
            targetLevel,
            lexicon,
            heldLemmas,
            rewrite: rewriteForBatch,
            cache,
          });

          if (result.status === "ready" && result.adapted) adapted++;
          else if (result.status === "ready" && !result.adapted) skipped++;
          else failed++;
        }
      }
    }

    expect(adapted + skipped + failed).toBeGreaterThan(0);
    console.log(`adapt-catalogue: adapted=${adapted} skipped=${skipped} failed=${failed}`);
  });
});
