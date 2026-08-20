import { describe, expect, it } from "vitest";

import { meaningRecallTaskIdFor } from "@/lib/form-recall-pool";
import { applyReview, newTask, retrievability } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import {
  computeCandidateWeight,
  DEFAULT_SAMPLING_CONFIG,
  phiFoundation,
  sampleSession,
  type SamplingContext,
} from "@/lib/session-sampling";
import { buildSamplingContext } from "@/lib/sampling-context";

function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function card(overrides: Partial<StarterCard> & Pick<StarterCard, "taskId" | "wordId" | "lemma">): StarterCard {
  return {
    front: overrides.lemma,
    descriptionKey: `gloss.${overrides.lemma}`,
    back: overrides.back ?? "gloss",
    frequencyRank: overrides.frequencyRank ?? 1,
    ...overrides,
  };
}

function heldMeaningTask(taskId: string, wordId: string, now: number) {
  let task = newTask(taskId, wordId);
  task = applyReview(task, "easy", now - 20 * 86_400_000).task;
  task = applyReview(task, "good", now - 15 * 86_400_000).task;
  task = applyReview(task, "good", now - 10 * 86_400_000).task;
  return task;
}

describe("session-sampling", () => {
  const now = Date.UTC(2026, 7, 20, 12, 0, 0);
  const emptyContext: SamplingContext = {
    heldMeaningRecall: 0,
    newFirstReviewCountToday: 0,
    gradesTodayByTaskId: {},
  };

  it("draws all-new sessions without strict frequency sort", () => {
    const pool = [
      card({ taskId: "es:a:meaning-recall", wordId: "es:a", lemma: "a", frequencyRank: 3 }),
      card({ taskId: "es:b:meaning-recall", wordId: "es:b", lemma: "b", frequencyRank: 1 }),
      card({ taskId: "es:c:meaning-recall", wordId: "es:c", lemma: "c", frequencyRank: 2 }),
    ];
    const picked = sampleSession(pool, {}, now, 3, emptyContext, {
      deck: "meaning",
      rng: seededRng(42),
    });
    expect(picked).toHaveLength(3);
    expect(picked.every((entry) => entry.isNew)).toBe(true);

    let rank1First = 0;
    for (let seed = 0; seed < 200; seed += 1) {
      const run = sampleSession(pool, {}, now, 1, emptyContext, {
        deck: "meaning",
        rng: seededRng(seed),
      });
      if (run[0]?.card.frequencyRank === 1) rank1First += 1;
    }
    expect(rank1First).toBeGreaterThan(80);
  });

  it("favours lower retrievability in Monte Carlo draws", () => {
    const reviewedAt = now - 5 * 86_400_000;
    let low = newTask("es:low:meaning-recall", "es:low");
    let high = newTask("es:high:meaning-recall", "es:high");
    low = applyReview(low, "good", reviewedAt).task;
    low = applyReview(low, "good", reviewedAt + 86_400_000).task;
    high = applyReview(high, "good", reviewedAt).task;
    high = applyReview(high, "good", reviewedAt + 86_400_000).task;
    high = applyReview(high, "good", reviewedAt + 2 * 86_400_000).task;
    high = applyReview(high, "easy", reviewedAt + 3 * 86_400_000).task;

    expect(retrievability(low, now)).toBeLessThan(retrievability(high, now));

    const pool = [
      card({ taskId: low.id, wordId: low.wordId, lemma: "low", frequencyRank: 1 }),
      card({ taskId: high.id, wordId: high.wordId, lemma: "high", frequencyRank: 2 }),
    ];
    const tasks = { [low.id]: low, [high.id]: high };
    const context = { ...emptyContext, heldMeaningRecall: 2 };

    let lowHits = 0;
    for (let seed = 0; seed < 1000; seed += 1) {
      const picked = sampleSession(pool, tasks, now, 1, context, {
        deck: "meaning",
        rng: seededRng(seed),
      });
      if (picked[0]?.card.taskId === low.id) lowHits += 1;
    }
    expect(lowHits).toBeGreaterThan(520);
  });

  it("boosts tasks graded again today over good today", () => {
    const reviewedAt = now - 2 * 86_400_000;
    let againTask = newTask("es:again:meaning-recall", "es:again");
    let goodTask = newTask("es:good:meaning-recall", "es:good");
    againTask = applyReview(againTask, "good", reviewedAt).task;
    againTask = applyReview(againTask, "good", reviewedAt + 86_400_000).task;
    goodTask = applyReview(goodTask, "good", reviewedAt).task;
    goodTask = applyReview(goodTask, "good", reviewedAt + 86_400_000).task;

    const context: SamplingContext = {
      heldMeaningRecall: 0,
      newFirstReviewCountToday: 0,
      gradesTodayByTaskId: {
        [againTask.id]: "again",
        [goodTask.id]: "good",
      },
    };
    const pool = [
      card({ taskId: againTask.id, wordId: againTask.wordId, lemma: "again", frequencyRank: 1 }),
      card({ taskId: goodTask.id, wordId: goodTask.wordId, lemma: "good", frequencyRank: 2 }),
    ];
    const tasks = { [againTask.id]: againTask, [goodTask.id]: goodTask };

    let againHits = 0;
    for (let seed = 0; seed < 500; seed += 1) {
      const picked = sampleSession(pool, tasks, now, 1, context, {
        deck: "meaning",
        rng: seededRng(seed),
      });
      if (picked[0]?.card.taskId === againTask.id) againHits += 1;
    }
    expect(againHits).toBeGreaterThan(280);
  });

  it("throttles new cards when many were introduced today", () => {
    const reviewedAt = now - 3 * 86_400_000;
    let fragile = newTask("es:seen:meaning-recall", "es:seen");
    fragile = applyReview(fragile, "good", reviewedAt).task;
    fragile = applyReview(fragile, "good", reviewedAt + 86_400_000).task;

    const newCards = Array.from({ length: 8 }, (_, index) =>
      card({
        taskId: `es:new${index}:meaning-recall`,
        wordId: `es:new${index}`,
        lemma: `new${index}`,
        frequencyRank: index + 1,
      }),
    );
    const pool = [
      card({ taskId: fragile.id, wordId: fragile.wordId, lemma: "seen", frequencyRank: 50 }),
      ...newCards,
    ];
    const tasks = { [fragile.id]: fragile };
    const heavy: SamplingContext = {
      heldMeaningRecall: 0,
      newFirstReviewCountToday: 8,
      gradesTodayByTaskId: {},
    };
    const fresh: SamplingContext = {
      heldMeaningRecall: 0,
      newFirstReviewCountToday: 0,
      gradesTodayByTaskId: {},
    };

    const rate = (context: SamplingContext, targetTaskId: string) => {
      let hits = 0;
      for (let seed = 0; seed < 400; seed += 1) {
        const picked = sampleSession(pool, tasks, now, 3, context, {
          deck: "meaning",
          rng: seededRng(seed),
        });
        if (picked.some((entry) => entry.card.taskId === targetTaskId)) hits += 1;
      }
      return hits / 400;
    };

    expect(rate(heavy, newCards[7]!.taskId)).toBeLessThan(rate(fresh, newCards[7]!.taskId) * 0.92);
  });

  it("tapers foundation bias when held count is high", () => {
    expect(phiFoundation(80, DEFAULT_SAMPLING_CONFIG)).toBeLessThan(0.05);
  });

  it("resurfaces fragile words on a second same-day session after all good", () => {
    const session1Cards = Array.from({ length: 10 }, (_, index) => {
      const lemma = `lemma${index}`;
      const wordId = `es:${lemma}`;
      const taskId = `${wordId}:meaning-recall`;
      return {
        card: card({ taskId, wordId, lemma, frequencyRank: index + 1 }),
        taskId,
      };
    });

    const tasks: Record<string, ReturnType<typeof newTask>> = {};
    const reviews: Array<{ taskId: string; grade: "good"; reviewedAt: number }> = [];
    const sessionStart = now - 3 * 3_600_000;

    for (const entry of session1Cards) {
      let task = newTask(entry.taskId, entry.card.wordId);
      task = applyReview(task, "good", sessionStart).task;
      tasks[entry.taskId] = task;
      reviews.push({ taskId: entry.taskId, grade: "good", reviewedAt: sessionStart });
    }

    const extraNew = Array.from({ length: 30 }, (_, index) =>
      card({
        taskId: `es:new${index}:meaning-recall`,
        wordId: `es:new${index}`,
        lemma: `new${index}`,
        frequencyRank: 100 + index,
      }),
    );

    const pool = [...session1Cards.map((entry) => entry.card), ...extraNew];
    const context = buildSamplingContext(
      reviews,
      session1Cards.map((entry) => entry.card),
      tasks,
      now,
    );

    let overlapTrials = 0;
    for (let seed = 0; seed < 200; seed += 1) {
      const picked = sampleSession(pool, tasks, now, 10, context, {
        deck: "meaning",
        rng: seededRng(seed + 1000),
      });
      const lemmas = new Set(picked.map((entry) => entry.card.lemma));
      const overlap = session1Cards.filter((entry) => lemmas.has(entry.card.lemma)).length;
      if (overlap / session1Cards.length >= 0.2) overlapTrials += 1;
    }
    expect(overlapTrials).toBeGreaterThanOrEqual(140);
  });

  it("keeps unreviewed form-recall weight far below meaning-recall", () => {
    const meaning = card({
      taskId: "es:hablar:meaning-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      frequencyRank: 1,
    });
    const form = card({
      taskId: "es:hablar:habla:form-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      frequencyRank: 1,
      paradigmCell: "ind.pres.3sg",
      back: "habla",
    });
    const tasks = {
      [meaning.taskId]: newTask(meaning.taskId, meaning.wordId),
    };
    const meaningWeight = computeCandidateWeight(
      meaning,
      tasks[meaning.taskId]!,
      now,
      emptyContext,
      tasks,
    ).weight;
    const formWeight = computeCandidateWeight(
      form,
      newTask(form.taskId, form.wordId),
      now,
      emptyContext,
      tasks,
    ).weight;
    expect(formWeight).toBeLessThan(meaningWeight * 0.01);
  });

  it("gives held meaning full form staging weight", () => {
    const meaning = card({
      taskId: "es:hablar:meaning-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      frequencyRank: 1,
    });
    const form = card({
      taskId: "es:hablar:habla:form-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      frequencyRank: 1,
      paradigmCell: "ind.pres.3sg",
      back: "habla",
    });
    const meaningTask = heldMeaningTask(meaning.taskId, meaning.wordId, now);
    const tasks = {
      [meaning.taskId]: meaningTask,
      [form.taskId]: newTask(form.taskId, form.wordId),
    };
    const weighted = computeCandidateWeight(
      form,
      tasks[form.taskId]!,
      now,
      { ...emptyContext, heldMeaningRecall: 1 },
      tasks,
    );
    expect(weighted.factors.f).toBe(1);
  });

  it("is deterministic with the same rng seed", () => {
    const pool = [
      card({ taskId: "es:a:meaning-recall", wordId: "es:a", lemma: "a", frequencyRank: 1 }),
      card({ taskId: "es:b:meaning-recall", wordId: "es:b", lemma: "b", frequencyRank: 2 }),
      card({ taskId: "es:c:meaning-recall", wordId: "es:c", lemma: "c", frequencyRank: 3 }),
    ];
    const a = sampleSession(pool, {}, now, 2, emptyContext, {
      deck: "meaning",
      rng: seededRng(99),
    }).map((entry) => entry.card.taskId);
    const b = sampleSession(pool, {}, now, 2, emptyContext, {
      deck: "meaning",
      rng: seededRng(99),
    }).map((entry) => entry.card.taskId);
    expect(a).toEqual(b);
  });

  it("buildSamplingContext counts first reviews today", () => {
    const meaning = card({
      taskId: "es:a:meaning-recall",
      wordId: "es:a",
      lemma: "a",
      frequencyRank: 1,
    });
    const context = buildSamplingContext(
      [{ taskId: meaning.taskId, grade: "good", reviewedAt: now - 1_000 }],
      [meaning],
      { [meaning.taskId]: applyReview(newTask(meaning.taskId, meaning.wordId), "good", now - 1_000).task },
      now,
    );
    expect(context.newFirstReviewCountToday).toBe(1);
    expect(context.gradesTodayByTaskId[meaning.taskId]).toBe("good");
  });

  it("uses meaningRecallTaskIdFor for form staging", () => {
    const form = card({
      taskId: "es:hablar:habla:form-recall",
      wordId: "es:hablar",
      lemma: "hablar",
      frequencyRank: 1,
      back: "habla",
    });
    const meaningId = meaningRecallTaskIdFor(form);
    let meaningTask = newTask(meaningId, form.wordId);
    meaningTask = applyReview(meaningTask, "good", now - 1_000).task;
    const tasks = { [meaningId]: meaningTask };
    const weighted = computeCandidateWeight(
      form,
      newTask(form.taskId, form.wordId),
      now,
      emptyContext,
      tasks,
    );
    expect(weighted.factors.f).toBeGreaterThan(DEFAULT_SAMPLING_CONFIG.epsilon);
  });
});
