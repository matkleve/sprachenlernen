import { describe, expect, it } from "vitest";

import { buildFormCellExplanation } from "@/lib/form-cell-explanation";
import { loadSpanishFormRecallDeck } from "@/lib/form-recall-pool";
import { applyReview, newTask } from "@/lib/scheduler";

describe("form-cell-explanation", () => {
  const deck = loadSpanishFormRecallDeck();
  if (deck.status !== "ok") throw new Error("setup failed");

  const hablar = deck.deck.cards.find((card) => card.lemma === "hablar");
  const comer = deck.deck.cards.find((card) => card.lemma === "comer");

  it("returns a rule key for a regular -ar present cell", () => {
    expect(hablar?.paradigmCell).toBeDefined();
    if (!hablar?.paradigmCell) return;

    const explanation = buildFormCellExplanation({
      languageCode: "es",
      wordId: hablar.wordId,
      paradigmCell: hablar.paradigmCell!,
      surfaceForm: hablar.back!,
      pool: deck.deck.cards,
      tasksByTaskId: {},
    });

    expect(explanation?.ruleKey).toBe("formRules.es.verb1.ind.pres");
    expect(explanation?.exampleSurfaces).toContain(hablar.back);
  });

  it("can add a held lemma in the same class as an example", () => {
    expect(hablar && comer).toBeTruthy();
    if (!hablar || !comer) return;

    let comerTask = newTask(comer.taskId, comer.wordId);
    comerTask = applyReview(comerTask, "good", Date.now() - 20 * 86_400_000).task;
    comerTask = applyReview(comerTask, "good", Date.now() - 10 * 86_400_000).task;

    const explanation = buildFormCellExplanation({
      languageCode: "es",
      wordId: hablar.wordId,
      paradigmCell: hablar.paradigmCell!,
      surfaceForm: hablar.back!,
      pool: deck.deck.cards,
      tasksByTaskId: { [comer.taskId]: comerTask },
    });

    expect(explanation?.exampleSurfaces).toContain(hablar.back);
    expect(explanation?.ruleKey).toBe("formRules.es.verb1.ind.pres");
  });

  it("uses the irregular rule for ser", () => {
    const ser = deck.deck.cards.find((card) => card.lemma === "ser");
    expect(ser?.paradigmCell).toBeDefined();
    if (!ser?.paradigmCell) return;

    const explanation = buildFormCellExplanation({
      languageCode: "es",
      wordId: ser.wordId,
      paradigmCell: ser.paradigmCell!,
      surfaceForm: ser.back!,
      pool: deck.deck.cards,
      tasksByTaskId: {},
    });

    expect(explanation?.ruleKey).toBe("formRules.es.irregular");
  });
});
