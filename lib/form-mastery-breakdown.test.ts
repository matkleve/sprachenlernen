import { describe, expect, it } from "vitest";

import {
  buildFormCellGroupBreakdown,
  isWeakFormCellGroup,
} from "@/lib/form-mastery-breakdown";
import { applyReview, newTask, rebuild } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";

const now = Date.UTC(2026, 7, 9);

function formCard(
  taskId: string,
  paradigmCell: string,
  frequencyRank = 1,
): StarterCard {
  const wordId = taskId.replace(/:[^:]+:form-recall$/, "");
  return {
    taskId,
    wordId,
    lemma: wordId.split(":")[1] ?? wordId,
    front: "gloss",
    descriptionKey: "gloss.key",
    back: "surface",
    frequencyRank,
    paradigmCell,
  };
}

function heldForm(taskId: string) {
  const wordId = taskId.replace(/:[^:]+:form-recall$/, "");
  let task = newTask(taskId, wordId);
  task = applyReview(task, "easy", now - 20 * 86_400_000).task;
  task = applyReview(task, "good", now - 15 * 86_400_000).task;
  task = applyReview(task, "good", now - 10 * 86_400_000).task;
  return task;
}

describe("form-mastery-breakdown", () => {
  it("marks a group weak when reviewed but fewer than half held", () => {
    expect(isWeakFormCellGroup(0, 2, 4)).toBe(true);
    expect(isWeakFormCellGroup(2, 2, 4)).toBe(false);
    expect(isWeakFormCellGroup(0, 0, 4)).toBe(false);
  });

  it("aggregates present indicative cells into one row", () => {
    const cards = [
      formCard("es:hablar:hablo:form-recall", "ind.pres.1sg", 1),
      formCard("es:hablar:habla:form-recall", "ind.pres.3sg", 2),
      formCard("es:hablar:hablan:form-recall", "ind.pres.3pl", 3),
      formCard("es:casa:casas:form-recall", "pl", 4),
    ];
    const tasks = {
      [cards[0]!.taskId]: heldForm(cards[0]!.taskId),
      [cards[1]!.taskId]: rebuild(cards[1]!.taskId, cards[1]!.wordId, [
        { at: now - 86_400_000, grade: "again" },
      ]).task,
    };

    const rows = buildFormCellGroupBreakdown(cards, tasks);
    const present = rows.find((row) => row.groupKey === "verb:present");

    expect(present).toMatchObject({ held: 1, reviewed: 2, poolSize: 3, weak: true });
    expect(rows.some((row) => row.groupKey === "nominal:plural")).toBe(true);
  });
});
