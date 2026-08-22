/**
 * Contract: docs/specs/feature/content-traceability.md (T-W11)
 */
import { describe, expect, it } from "vitest";

import { computeSessionLoopPayoff } from "@/lib/session-loop-payoff";
import type { Source } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";
import { newTask } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";

const RAW_TABLE: Record<string, unknown> = {
  language: "es",
  seedForms: 5,
  seedCoverage: 1,
  verbLemmas: 0,
  verbParadigmsComplete: 0,
  sources: [{ source: "test", licence: "MIT", url: "https://example.invalid" }],
  lemmas: { uno: { noun: "m" }, dos: { noun: "m" }, casa: { noun: "f" } },
  fused: {},
  forms: {
    uno: [["uno", "num", ""]],
    dos: [["dos", "num", ""]],
    casa: [["casa", "noun", "sg"]],
  },
};

const profile = loadProfile({
  code: "es",
  name: "Test",
  script: "latin",
  morphology: "fusional",
  countingUnit: "lemma",
  frequency: {
    source: "s",
    corpus: "c",
    version: "1",
    licence: "MIT",
    unit: "form",
    file: "f",
  },
}).profile!;

const lexicon = buildLexicon(
  profile,
  parseFrequencyList("uno 100\ndos 90\ncasa 80\n"),
  loadLemmaTable(RAW_TABLE, "es").table!,
);

const meaningCards: StarterCard[] = [
  {
    taskId: "es:uno:meaning-recall",
    wordId: "es:uno",
    lemma: "uno",
    frequencyRank: 1,
  },
  {
    taskId: "es:casa:meaning-recall",
    wordId: "es:casa",
    lemma: "casa",
    frequencyRank: 2,
  },
];

const fixtureSource: Source = {
  id: "es-fixture",
  languageCode: "es",
  kind: "text",
  title: "Demo",
  origin: "fixture",
  body: "Uno dos casa.",
  addedAt: "2026-08-22T00:00:00.000Z",
};

describe("computeSessionLoopPayoff", () => {
  it("returns none when no lemma became held", () => {
    const tasksByTaskId = {
      "es:uno:meaning-recall": newTask("es:uno:meaning-recall", "es:uno"),
    };
    const payoff = computeSessionLoopPayoff(
      meaningCards,
      tasksByTaskId,
      new Set(["dos"]),
      [{ taskId: "es:uno:meaning-recall", grade: "again", reviewedAtMs: 1 }],
      [fixtureSource],
      lexicon,
    );

    expect(payoff.kind).toBe("none");
  });

  it("names source coverage deltas when a newly held lemma appears in persisted text", () => {
    const tasksByTaskId = {
      "es:uno:meaning-recall": newTask("es:uno:meaning-recall", "es:uno"),
    };
    const heldAtStart = new Set<string>();
    const payoff = computeSessionLoopPayoff(
      meaningCards,
      tasksByTaskId,
      heldAtStart,
      [
        { taskId: "es:uno:meaning-recall", grade: "easy", reviewedAtMs: 1_000 },
        { taskId: "es:uno:meaning-recall", grade: "easy", reviewedAtMs: 2_000 },
        { taskId: "es:uno:meaning-recall", grade: "good", reviewedAtMs: 3_000 },
      ],
      [fixtureSource],
      lexicon,
    );

    expect(payoff.kind).toBe("payoff");
    if (payoff.kind !== "payoff") return;
    expect(payoff.newlyHeldCount).toBe(1);
    expect(payoff.sourceDeltas.length).toBe(1);
    expect(payoff.sourceDeltas[0]?.afterPercent).toBeGreaterThan(
      payoff.sourceDeltas[0]?.beforePercent ?? 0,
    );
    expect(payoff.linkTarget).toBe("content");
  });
});
