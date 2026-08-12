import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  isFormRecallTaskId,
  loadItalianFormRecallDeck,
  loadSpanishFormRecallDeck,
  meaningRecallTaskIdFor,
  type FormRecallCard,
} from "@/lib/form-recall-pool";
import { filterSchedulableCards } from "@/lib/form-recall-staging";
import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { loadLemmaTable } from "@/lib/lemma-table";
import { applyReview, newTask as schedulerNewTask } from "@/lib/scheduler";
import { bucketForTask } from "@/lib/vocabulary-snapshot";

describe("form-recall pool", () => {
  it("loads the shipped Spanish form-recall pool", () => {
    const result = loadSpanishFormRecallDeck();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.deck.taskType).toBe("form-recall");
    const cards = result.deck.cards as FormRecallCard[];
    expect(cards.length).toBeGreaterThan(1500);
    const hablar = cards.find((card) => card.lemma === "hablar");
    expect(hablar?.taskId).toBe("es:hablar:habla:form-recall");
    expect(hablar?.surfaceForm).toBe("habla");
    expect(hablar?.paradigmCell).toBe("ind.pres.3sg");
    expect(hablar?.back).toBe("habla");
  });

  it("tags hablo with the lemma-table cell", () => {
    const { table, errors } = loadLemmaTable(
      JSON.parse(readFileSync("data/lemma/es.json", "utf8")),
      "es",
    );
    if (errors.length > 0) throw new Error(errors.join("; "));
    const analysis = table!.forms.hablo?.[0];
    expect(analysis?.lemma).toBe("hablar");
    expect(analysis?.cell).toBe("ind.pres.1sg");
  });

  it("loads the shipped Italian form-recall pool", () => {
    const result = loadItalianFormRecallDeck();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.deck.taskType).toBe("form-recall");
    const cards = result.deck.cards as FormRecallCard[];
    expect(cards.length).toBeGreaterThan(1400);
    const parlare = cards.find((card) => card.lemma === "parlare");
    expect(parlare?.taskId).toBe("it:parlare:parla:form-recall");
    expect(parlare?.surfaceForm).toBe("parla");
    expect(parlare?.paradigmCell).toBe("ind.pres.3sg");
    expect(parlare?.back).toBe("parla");
    expect(parlare?.front).not.toMatch(/write the Italian form/i);
  });

  it("derives the sibling meaning-recall task id from wordId", () => {
    expect(meaningRecallTaskIdFor({ wordId: "es:hablar" })).toBe("es:hablar:meaning-recall");
    expect(isFormRecallTaskId("es:hablar:hablo:form-recall")).toBe(true);
    expect(isFormRecallTaskId("es:hablar:meaning-recall")).toBe(false);
  });
});

describe("form-recall staging", () => {
  const meaningDeck = loadSpanishMeaningRecallDeck();
  const formDeck = loadSpanishFormRecallDeck();
  if (meaningDeck.status !== "ok" || formDeck.status !== "ok") {
    throw new Error("pools failed to load in test setup");
  }

  const hablarMeaning = meaningDeck.deck.cards.find((card) => card.lemma === "hablar")!;
  const hablarForm = formDeck.deck.cards.find((card) => card.lemma === "hablar")! as FormRecallCard;

  it("withholds form-recall until meaning-recall is held", () => {
    const now = Date.now();
    let meaningTask = schedulerNewTask(hablarMeaning.taskId, hablarMeaning.wordId);
    expect(bucketForTask(meaningTask)).toBe("new");

    const blocked = filterSchedulableCards(
      [hablarMeaning, hablarForm],
      { [hablarMeaning.taskId]: meaningTask },
    );
    expect(blocked.map((card) => card.taskId)).toEqual([hablarMeaning.taskId]);

    meaningTask = applyReview(meaningTask, "easy", now - 86_400_000).task;
    meaningTask = applyReview(meaningTask, "good", now - 43_200_000).task;
    expect(bucketForTask(meaningTask)).toBe("held");

    const open = filterSchedulableCards(
      [hablarMeaning, hablarForm],
      { [hablarMeaning.taskId]: meaningTask },
    );
    expect(open.map((card) => card.taskId).sort()).toEqual(
      [hablarMeaning.taskId, hablarForm.taskId].sort(),
    );
  });
});
