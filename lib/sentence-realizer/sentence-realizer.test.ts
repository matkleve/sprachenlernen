/**
 * Contract: lib/sentence-realizer/*
 */
import { describe, expect, it } from "vitest";

import {
  loadSentencePlans,
  loadSpanishRealizerContext,
  pickShuffledPlan,
} from "@/lib/sentence-realizer/load-context";
import { renderSpanishPlanAllPersons } from "@/lib/sentence-realizer/realize-es";

describe("sentence-realizer", () => {
  it("renders six present-tense persons for a leer + libro plan", () => {
    const ctx = loadSpanishRealizerContext();
    const plan = loadSentencePlans("es").find((row) => row.id === "es-plan-leer-libro")!;

    const rows = renderSpanishPlanAllPersons(plan, ctx);
    expect(rows).toHaveLength(6);
    expect(rows.map((row) => row.personId)).toEqual([
      "1sg",
      "2sg",
      "3sg",
      "1pl",
      "2pl",
      "3pl",
    ]);
    expect(rows[0]?.text).toBe("Yo leo el libro.");
    expect(rows[2]?.text).toBe("Él lee el libro.");
    expect(rows[4]?.text).toBe("Vosotros leéis el libro.");
  });

  it("shuffles deterministically by seed", () => {
    const plans = loadSentencePlans("es");
    expect(pickShuffledPlan(plans, 0).id).not.toBe(pickShuffledPlan(plans, 1).id);
    expect(pickShuffledPlan(plans, 9).id).toBe(pickShuffledPlan(plans, 9).id);
  });
});
