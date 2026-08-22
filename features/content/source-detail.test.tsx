import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderWithIntl, screen } from "@/tests/i18n-test-utils";
import { describe, expect, it } from "vitest";

import { SourceDetail } from "@/features/content/SourceDetail";
import type { SourceDetailReading } from "@/features/content/reading";
import { computeGapSet, dailyHeldLemmaCounts, estimateGapPace } from "@/lib/content-gap";
import { computeCoverage, loadSources } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";

const ROOT = join(__dirname, "..", "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

function esLexicon() {
  const profile = loadProfile(JSON.parse(readData("data/languages/es.json"))).profile!;
  const table = loadLemmaTable(JSON.parse(readData("data/lemma/es.json")), "es").table!;
  return buildLexicon(profile, parseFrequencyList(readData("data/frequency/es.txt")), table);
}

function demandingFixtureReading(): SourceDetailReading {
  const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
  const source = sources.find((entry) => entry.id === "es-fixture-cafe");
  expect(source).toBeDefined();
  if (!source) throw new Error("fixture missing");

  const lexicon = esLexicon();
  const held = new Set(["uno", "dos", "tres"]);
  const text = source.body ?? "";
  const coverage = computeCoverage(text, lexicon, held);
  const gap = computeGapSet(text, lexicon, held, {
    glossForLemma: (lemma) => `gloss:${lemma}`,
  });
  const pace = estimateGapPace(
    gap.kind === "list" ? gap.gapCount : 0,
    dailyHeldLemmaCounts([], [], Date.now()),
  );

  return {
    source,
    coverage,
    gap,
    pace,
    gapProgress: null,
    activeGapLemmas: [],
    textSentences: null,
    comprehensionQuestions: [],
    adapted: false,
    targetLevel: "A2",
    generated: false,
    unlockLine: null,
  };
}

describe("SourceDetail", () => {
  it("shows coverage percent, gap count, and demanding loop line for a fixture source", async () => {
    const reading = demandingFixtureReading();
    expect(reading.coverage.comfortBand).toBe("demanding");
    expect(reading.gap.kind).toBe("list");
    if (reading.gap.kind !== "list") return;

    const jsx = await SourceDetail({ reading });
    renderWithIntl(jsx);

    expect(screen.getByText(new RegExp(`${reading.coverage.coveragePercent}\\s*% known`))).toBeDefined();
    expect(screen.getByText(new RegExp(`${reading.gap.gapCount} words stand between`))).toBeDefined();
    expect(screen.getByRole("heading", { name: /words to comfortable/ })).toBeDefined();
  });
});
