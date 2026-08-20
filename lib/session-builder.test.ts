import { describe, expect, it } from "vitest";

import { loadSpanishMeaningRecallDeck } from "@/lib/starter-deck";
import { buildSession, DEFAULT_SESSION_LENGTH } from "@/lib/session-builder";
import { computeCandidateWeight } from "@/lib/session-sampling";
import { applyReview, newTask } from "@/lib/scheduler";

const pool = loadSpanishMeaningRecallDeck();
const cards = pool.status === "ok" ? pool.deck.cards : [];

function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

describe("session-builder", () => {
  it("returns 15 cards from the starter pool with no history", () => {
    const session = buildSession(cards, {}, Date.now(), DEFAULT_SESSION_LENGTH, {
      deck: "meaning",
      rng: seededRng(7),
    });
    expect(session).toHaveLength(DEFAULT_SESSION_LENGTH);
    expect(session.every((card) => card.taskId.endsWith(":meaning-recall"))).toBe(true);
    expect(session[0]?.position).toBe(1);
    expect(session[0]?.total).toBe(DEFAULT_SESSION_LENGTH);
    expect(session[0]?.samplingReason).toBeDefined();
  });

  it("includes overdue reviewed tasks in the sampled queue", () => {
    const dueCard = cards[0]!;
    const reviewedAt = Date.now() - 30 * 86_400_000;
    let task = newTask(dueCard.taskId, dueCard.wordId);
    task = applyReview(task, "good", reviewedAt).task;
    task = applyReview(task, "good", reviewedAt + 86_400_000).task;
    task = applyReview(task, "good", reviewedAt + 2 * 86_400_000).task;
    const now = task.due + 10 * 86_400_000;

    const session = buildSession([dueCard], { [dueCard.taskId]: task }, now, 1, {
      deck: "meaning",
      rng: seededRng(1),
    });
    expect(session[0]?.taskId).toBe(dueCard.taskId);
  });

  it("returns every card when the pool is smaller than the session length", () => {
    const tiny = cards.slice(0, 10);
    const session = buildSession(tiny, {}, Date.now(), DEFAULT_SESSION_LENGTH, {
      deck: "meaning",
      rng: seededRng(1),
    });
    expect(session).toHaveLength(10);
  });

  it("includes at most one task per word when siblings are both due (AC-10)", () => {
    const meaning = cards.find((card) => card.lemma === "hablar" && card.taskId.endsWith(":meaning-recall"));
    expect(meaning).toBeDefined();
    if (!meaning) return;

    const form: typeof meaning = {
      ...meaning,
      taskId: "es:hablar:hablo:form-recall",
      front: "to speak",
      back: "hablo",
      paradigmCell: "ind.pres.1sg",
    };

    const reviewedAt = Date.now() - 14 * 86_400_000;
    const makeDue = (taskId: string, wordId: string) => {
      let task = newTask(taskId, wordId);
      task = applyReview(task, "good", reviewedAt).task;
      task = applyReview(task, "good", reviewedAt + 86_400_000).task;
      return task;
    };

    const now = Date.now();
    const session = buildSession(
      [meaning, form],
      {
        [meaning.taskId]: makeDue(meaning.taskId, meaning.wordId),
        [form.taskId]: makeDue(form.taskId, form.wordId),
      },
      now,
      DEFAULT_SESSION_LENGTH,
      { rng: seededRng(3) },
    );

    const wordIds = session.map((card) => card.wordId);
    expect(new Set(wordIds).size).toBe(wordIds.length);
    expect(session).toHaveLength(1);
  });

  it("returns only form-recall cards when deck=form", () => {
    const meaning = cards.find((card) => card.lemma === "hablar" && card.taskId.endsWith(":meaning-recall"));
    expect(meaning).toBeDefined();
    if (!meaning) return;

    const form = {
      ...meaning,
      taskId: "es:hablar:habla:form-recall",
      back: "habla",
      paradigmCell: "ind.pres.3sg",
    };

    const session = buildSession([meaning, form], {}, Date.now(), DEFAULT_SESSION_LENGTH, {
      deck: "form",
      rng: seededRng(2),
    });
    expect(session.every((card) => card.taskId.endsWith(":form-recall"))).toBe(true);
  });

  it("spaces form-recall cards so no two consecutive items share a lemma (T-W6)", () => {
    const meaning = cards.find((card) => card.lemma === "hablar" && card.taskId.endsWith(":meaning-recall"));
    expect(meaning).toBeDefined();
    if (!meaning) return;

    const forms = [
      { ...meaning, taskId: "es:hablar:hablo:form-recall", back: "hablo", paradigmCell: "ind.pres.1sg" },
      { ...meaning, taskId: "es:hablar:habla:form-recall", back: "habla", paradigmCell: "ind.pres.3sg", frequencyRank: 2 },
      { ...meaning, taskId: "es:comer:como:form-recall", back: "como", lemma: "comer", wordId: "es:comer", paradigmCell: "ind.pres.1sg", frequencyRank: 3 },
      { ...meaning, taskId: "es:vivir:vivo:form-recall", back: "vivo", lemma: "vivir", wordId: "es:vivir", paradigmCell: "ind.pres.1sg", frequencyRank: 4 },
    ];

    const session = buildSession(forms, {}, Date.now(), 4, {
      deck: "form",
      rng: seededRng(1),
      lemmaMeta: { hablar: { verb: "1" }, comer: { verb: "2" }, vivir: { verb: "3" } },
    });

    for (let index = 1; index < session.length; index += 1) {
      expect(session[index]!.lemma).not.toBe(session[index - 1]!.lemma);
    }
  });

  it("returns only meaning-recall cards when deck=meaning", () => {
    const meaning = cards[0]!;
    const form = {
      ...meaning,
      taskId: "es:hablar:habla:form-recall",
      back: "habla",
      paradigmCell: "ind.pres.3sg",
    };

    const session = buildSession([meaning, form], {}, Date.now(), DEFAULT_SESSION_LENGTH, {
      deck: "meaning",
      rng: seededRng(4),
    });
    expect(session.every((card) => card.taskId.endsWith(":meaning-recall"))).toBe(true);
  });

  it("boosts gap-set lemmas among new cards", () => {
    const priorityCard = cards[5]!;
    const other = cards[10]!;
    const context = { heldMeaningRecall: 0, newFirstReviewCountToday: 0, gradesTodayByTaskId: {} };
    const tasks = {};
    const boosted = computeCandidateWeight(
      priorityCard,
      newTask(priorityCard.taskId, priorityCard.wordId),
      Date.now(),
      context,
      tasks,
      { priorityLemmas: new Set([priorityCard.lemma]) },
    ).weight;
    const plain = computeCandidateWeight(
      other,
      newTask(other.taskId, other.wordId),
      Date.now(),
      context,
      tasks,
    ).weight;
    expect(boosted).toBeGreaterThan(plain);
  });
});
