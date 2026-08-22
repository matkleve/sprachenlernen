/**
 * Contract: docs/specs/service/form-mastery-signal.md (T-W5)
 */
import { describe, expect, it } from "vitest";

import { isWeakFormGroup, readFormMasteryGroups } from "@/lib/form-mastery-groups";
import { rebuild } from "@/lib/scheduler";

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

describe("readFormMasteryGroups", () => {
  const formCards = [
    {
      taskId: "es:hablar:habla:form-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      surfaceForm: "habla",
      paradigmCell: "ind.pres.3sg",
      front: "to speak",
      back: "habla",
      frequencyRank: 10,
      descriptionKey: "card.es:hablar.form-recall.front",
    },
    {
      taskId: "es:ser:es:form-recall",
      wordId: "es:ser",
      lemma: "ser",
      surfaceForm: "es",
      paradigmCell: "ind.pres.3sg",
      front: "to be",
      back: "es",
      frequencyRank: 4,
      descriptionKey: "card.es:ser.form-recall.front",
    },
  ] as const;

  it("counts held forms per cell group", () => {
    const hablarHeld = rebuild("es:hablar:habla:form-recall", "es:hablar", [
      { at: now - 10 * DAY, grade: "good" },
      { at: now - 7 * DAY, grade: "good" },
      { at: now - 4 * DAY, grade: "good" },
    ]).task;
    const serFragile = rebuild("es:ser:es:form-recall", "es:ser", [
      { at: now - DAY, grade: "hard" },
    ]).task;

    const rows = readFormMasteryGroups(formCards, [hablarHeld, serFragile], "es");
    const arPresent = rows.find((row) => row.groupKey === "verb-1-ind.pres");
    const irregularPresent = rows.find((row) => row.groupKey === "irregular-ind.pres");

    expect(arPresent).toEqual({
      groupKey: "verb-1-ind.pres",
      labelKey: "formCellGroups.es.verb-1-ind.pres",
      held: 1,
      total: 1,
    });
    expect(irregularPresent?.held).toBe(0);
    expect(irregularPresent?.total).toBe(1);
    expect(isWeakFormGroup(irregularPresent!)).toBe(true);
  });
});
