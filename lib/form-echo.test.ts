import { describe, expect, it } from "vitest";

import { applyFormEcho, confusableTwinCell, planFormEcho } from "@/lib/form-echo";
import type { SessionCard } from "@/lib/session-builder";

function formCard(
  lemma: string,
  cell: string,
  surface: string,
  rank = 1,
): SessionCard {
  return {
    taskId: `es:${lemma}:${surface}:form-recall`,
    wordId: `es:${lemma}`,
    lemma,
    front: "gloss",
    descriptionKey: "gloss.key",
    back: surface,
    frequencyRank: rank,
    paradigmCell: cell,
    position: 1,
    total: 1,
  };
}

describe("form-echo", () => {
  it("pairs present with preterite for the same person", () => {
    expect(confusableTwinCell("ind.pres.1sg")).toBe("ind.pret.1sg");
    expect(confusableTwinCell("ind.pret.3pl")).toBe("ind.pres.3pl");
  });

  it("moves a confusable twin 2–5 slots ahead after a grade", () => {
    const queue = [
      formCard("hablar", "ind.pres.1sg", "hablo", 1),
      formCard("comer", "ind.pres.1sg", "como", 2),
      formCard("vivir", "ind.pres.1sg", "vivo", 3),
      formCard("hablar", "ind.pret.1sg", "hablé", 4),
      formCard("ser", "ind.pres.3sg", "es", 5),
    ];

    const plan = planFormEcho(queue, 0, () => 0.99);
    expect(plan).toEqual({ insertAt: 4, fromIndex: 3 });

    const mixed = applyFormEcho(queue, plan!);
    expect(mixed[3]?.taskId).toBe("es:hablar:hablé:form-recall");
  });

  it("does nothing when the twin is not still in the queue", () => {
    const queue = [
      formCard("hablar", "ind.pres.1sg", "hablo"),
      formCard("comer", "ind.pres.1sg", "como"),
    ];
    expect(planFormEcho(queue, 0)).toBeNull();
  });
});
