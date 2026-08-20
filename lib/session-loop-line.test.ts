/**
 * Contract: docs/specs/feature/content-traceability.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadSources } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";
import { routes } from "@/lib/routes";
import { buildSessionLoopLine } from "@/lib/session-loop-line";

const ROOT = join(__dirname, "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

const esLexicon = () => {
  const profile = loadProfile(JSON.parse(readData("data/languages/es.json"))).profile!;
  const table = loadLemmaTable(JSON.parse(readData("data/lemma/es.json")), "es").table!;
  return buildLexicon(profile, parseFrequencyList(readData("data/frequency/es.txt")), table);
};

describe("session-loop-line", () => {
  it("links to a source detail when one persisted source gains coverage", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const line = buildSessionLoopLine({
      sources,
      lexicon: esLexicon(),
      heldLemmasBefore: new Set(["uno", "dos", "tres"]),
      newlyHeldLemmas: ["casa"],
    });

    expect(line).toEqual({
      heldCount: 1,
      href: routes.contentDetail("es-fixture-cafe"),
    });
  });

  it("links to the content library when multiple sources gain coverage", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const line = buildSessionLoopLine({
      sources,
      lexicon: esLexicon(),
      heldLemmasBefore: new Set(),
      newlyHeldLemmas: ["uno", "gobierno"],
    });

    expect(line).toEqual({
      heldCount: 2,
      href: routes.content,
    });
  });

  it("returns null when no lemma became held", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    expect(
      buildSessionLoopLine({
        sources,
        lexicon: esLexicon(),
        heldLemmasBefore: new Set(["casa"]),
        newlyHeldLemmas: [],
      }),
    ).toBeNull();
  });

  it("returns null when newly held lemmas do not appear in persisted sources", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    expect(
      buildSessionLoopLine({
        sources,
        lexicon: esLexicon(),
        heldLemmasBefore: new Set(),
        newlyHeldLemmas: ["zzzzz"],
      }),
    ).toBeNull();
  });
});
