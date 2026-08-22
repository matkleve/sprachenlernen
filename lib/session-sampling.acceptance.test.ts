/**
 * Monte Carlo acceptance tests for session sampling (T-W22).
 * Contract: docs/specs/service/session-sampling.acceptance-criteria.md
 */
import { describe, expect, it } from "vitest";

import { emptySamplingContext } from "@/lib/sampling-context";
import { applyReview, newTask, retrievability, type Task } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import {
  DEFAULT_SAMPLING_CONFIG,
  sampleSession,
  weightCandidate,
  type SamplingContext,
  type SamplingReason,
} from "@/lib/session-sampling";
import { buildSession } from "@/lib/session-builder";

const DAY_MS = 86_400_000;
const DECAY = -0.5;
const FACTOR = 19 / 81;

const SAMPLING_REASONS: SamplingReason[] = [
  "low-recall",
  "struggled-today",
  "new-throttled",
  "form-staging",
  "frequency",
];

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const baseCard = (rank: number, lemma = `lemma${rank}`): StarterCard => ({
  taskId: `es:${lemma}:meaning-recall`,
  wordId: `es:${lemma}`,
  lemma,
  front: lemma,
  descriptionKey: `word.es.${lemma}`,
  frequencyRank: rank,
});

function taskAtRetrievability(targetR: number, now: number, taskId: string, wordId: string): Task {
  const reviewedAt = now - 60 * DAY_MS;
  let task = newTask(taskId, wordId);
  task = applyReview(task, "good", reviewedAt).task;
  const stability = task.stability ?? 1;
  const elapsedDays = (stability / FACTOR) * (Math.pow(targetR, 1 / DECAY) - 1);
  return {
    ...task,
    lastReviewAt: now - elapsedDays * DAY_MS,
  };
}

function monteCarloContext(
  now: number,
  rng: () => number,
  overrides: Partial<SamplingContext> = {},
) {
  return {
    now,
    heldMeaningRecall: 0,
    newFirstReviewCountToday: 0,
    gradesTodayByTaskId: new Map(),
    meaningSuccessCountByWordId: new Map(),
    reviewCountByTaskId: new Map(),
    rng,
    ...overrides,
  };
}

function pickLowRCount(
  low: Task,
  high: Task,
  trials: number,
  seed: number,
  contextOverrides: Partial<ReturnType<typeof monteCarloContext>> = {},
): number {
  const now = Date.now();
  let count = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    const rng = mulberry32(seed + trial);
    const picked = sampleSession({
      candidates: [
        { card: baseCard(1, "low"), task: low, isNew: false },
        { card: baseCard(2, "high"), task: high, isNew: false },
      ],
      context: monteCarloContext(now, rng, contextOverrides),
      sessionLength: 1,
    });
    if (picked[0]?.card.lemma === "low") count += 1;
  }
  return count;
}

describe("session-sampling acceptance (T-W22)", () => {
  it("AC-1: empty history draws new cards with lower frequency ranks more often", () => {
    const now = Date.now();
    const candidates = Array.from({ length: 20 }, (_, index) => ({
      card: baseCard(index + 1),
      task: newTask(`es:lemma${index + 1}:meaning-recall`, `es:lemma${index + 1}`),
      isNew: true,
    }));

    let rank1First = 0;
    let rank20First = 0;
    const trials = 400;
    for (let trial = 0; trial < trials; trial += 1) {
      const picked = sampleSession({
        candidates,
        context: monteCarloContext(now, mulberry32(trial + 42)),
        sessionLength: 15,
      });
      expect(picked.every((entry) => entry.isNew)).toBe(true);
      const firstRank = picked[0]?.card.frequencyRank;
      if (firstRank === 1) rank1First += 1;
      if (firstRank === 20) rank20First += 1;
    }

    expect(rank1First).toBeGreaterThan(rank20First * 4);
  });

  it("AC-2: lower retrievability appears in more sessions than high-R (Monte Carlo)", () => {
    const now = Date.now();
    const low = taskAtRetrievability(0.5, now, "es:low:meaning-recall", "es:low");
    const high = taskAtRetrievability(0.95, now, "es:high:meaning-recall", "es:high");
    expect(retrievability(low, now)).toBeLessThan(0.55);
    expect(retrievability(high, now)).toBeGreaterThan(0.9);

    const lowWins = pickLowRCount(low, high, 1000, 100);
    expect(lowWins).toBeGreaterThan(850);
  });

  it("AC-3: again today beats good today at equal retrievability", () => {
    const now = Date.now();
    const reviewedAt = now - 5 * DAY_MS;
    let againTask = newTask("es:a:meaning-recall", "es:a");
    let goodTask = newTask("es:b:meaning-recall", "es:b");
    againTask = applyReview(againTask, "good", reviewedAt).task;
    goodTask = applyReview(goodTask, "good", reviewedAt).task;
    againTask = applyReview(againTask, "again", now - 60_000).task;
    goodTask = applyReview(goodTask, "good", now - 60_000).task;

    const baseContext = {
      gradesTodayByTaskId: new Map([
        [againTask.id, "again" as const],
        [goodTask.id, "good" as const],
      ]),
      reviewCountByTaskId: new Map([
        [againTask.id, 2],
        [goodTask.id, 2],
      ]),
    };

    let againWins = 0;
    for (let trial = 0; trial < 500; trial += 1) {
      const picked = sampleSession({
        candidates: [
          { card: baseCard(1, "again"), task: againTask, isNew: false },
          { card: baseCard(2, "good"), task: goodTask, isNew: false },
        ],
        context: monteCarloContext(now, mulberry32(trial + 7), baseContext),
        sessionLength: 1,
      });
      if (picked[0]?.card.lemma === "again") againWins += 1;
    }
    expect(againWins).toBeGreaterThan(350);
  });

  it("AC-4: many new reviews today throttle further new cards (Monte Carlo)", () => {
    const now = Date.now();
    const dueTask = {
      ...taskAtRetrievability(0.5, now, "es:due:meaning-recall", "es:due"),
      due: now + DAY_MS,
    };
    const newCard = baseCard(2, "new");
    const pair = [
      { card: baseCard(1, "due"), task: dueTask, isNew: false },
      {
        card: newCard,
        task: newTask(newCard.taskId, newCard.wordId),
        isNew: true,
      },
    ];

    let newWinsThrottled = 0;
    let newWinsFresh = 0;
    const trials = 500;
    for (let trial = 0; trial < trials; trial += 1) {
      const throttled = sampleSession({
        candidates: pair,
        context: monteCarloContext(now, mulberry32(trial), { newFirstReviewCountToday: 8 }),
        sessionLength: 1,
      });
      if (throttled[0]?.card.lemma === "new") newWinsThrottled += 1;

      const fresh = sampleSession({
        candidates: pair,
        context: monteCarloContext(now, mulberry32(trial + 500), { newFirstReviewCountToday: 0 }),
        sessionLength: 1,
      });
      if (fresh[0]?.card.lemma === "new") newWinsFresh += 1;
    }

    expect(newWinsFresh).toBeGreaterThan(newWinsThrottled + 80);
  });

  it("AC-5: high held count keeps φ(H) below 0.05 and near retrievability-only mix", () => {
    const config = DEFAULT_SAMPLING_CONFIG;
    const phi = 1 / (1 + Math.exp((80 - config.H0) / config.tau));
    expect(phi).toBeLessThan(0.05);

    const now = Date.now();
    const low = taskAtRetrievability(0.55, now, "es:low:meaning-recall", "es:low");
    const high = taskAtRetrievability(0.65, now, "es:high:meaning-recall", "es:high");

    const lowWeight80 = weightCandidate(
      { card: baseCard(1, "low"), task: low, isNew: false },
      { ...emptySamplingContext(now), heldMeaningRecall: 80 },
    ).weight;
    const highWeight80 = weightCandidate(
      { card: baseCard(2, "high"), task: high, isNew: false },
      { ...emptySamplingContext(now), heldMeaningRecall: 80 },
    ).weight;
    const ratio80 = lowWeight80 / (lowWeight80 + highWeight80);

    const lowWeight500 = weightCandidate(
      { card: baseCard(1, "low"), task: low, isNew: false },
      { ...emptySamplingContext(now), heldMeaningRecall: 500 },
    ).weight;
    const highWeight500 = weightCandidate(
      { card: baseCard(2, "high"), task: high, isNew: false },
      { ...emptySamplingContext(now), heldMeaningRecall: 500 },
    ).weight;
    const ratio500 = lowWeight500 / (lowWeight500 + highWeight500);

    expect(ratio80).toBeGreaterThan(ratio500 * 0.9);
    expect(ratio80).toBeLessThan(ratio500 * 1.1);
  });

  it("AC-6: second same-day session overlaps first after all-good session 1 (Monte Carlo)", () => {
    const now = Date.now();
    const poolSize = 40;
    const candidates = Array.from({ length: poolSize }, (_, index) => ({
      card: baseCard(index + 1),
      task: newTask(`es:lemma${index + 1}:meaning-recall`, `es:lemma${index + 1}`),
      isNew: true,
    }));

    let overlapTrials = 0;
    const trials = 200;
    const sessionLength = 15;

    for (let trial = 0; trial < trials; trial += 1) {
      const rng = mulberry32(trial + 900);
      const session1 = sampleSession({
        candidates,
        context: monteCarloContext(now, rng, { heldMeaningRecall: 10 }),
        sessionLength,
      });
      const gradesToday = new Map(
        session1.map((entry) => [entry.card.taskId, "good" as const]),
      );
      const reviewCounts = new Map(session1.map((entry) => [entry.card.taskId, 1]));

      const session2 = sampleSession({
        candidates,
        context: monteCarloContext(now, mulberry32(trial + 1900), {
          heldMeaningRecall: 10,
          newFirstReviewCountToday: session1.length,
          gradesTodayByTaskId: gradesToday,
          reviewCountByTaskId: reviewCounts,
        }),
        sessionLength,
      });

      const firstIds = new Set(session1.map((entry) => entry.card.wordId));
      const overlap = session2.filter((entry) => firstIds.has(entry.card.wordId)).length;
      if (overlap / sessionLength >= 0.2) overlapTrials += 1;
    }

    expect(overlapTrials).toBeGreaterThanOrEqual(Math.floor(trials * 0.7));
  });

  it("AC-7: form-recall stays below 1% of meaning weight with zero meaning reviews", () => {
    const now = Date.now();
    const context = {
      ...emptySamplingContext(now),
      meaningSuccessCountByWordId: new Map([["es:hablar", 0]]),
    };
    const formWeight = weightCandidate(
      {
        card: {
          ...baseCard(1),
          taskId: "es:hablar:hablo:form-recall",
          wordId: "es:hablar",
          back: "hablo",
        },
        task: newTask("es:hablar:hablo:form-recall", "es:hablar"),
        isNew: true,
      },
      context,
    ).weight;
    const meaningWeight = weightCandidate(
      {
        card: { ...baseCard(1), taskId: "es:hablar:meaning-recall", wordId: "es:hablar" },
        task: newTask("es:hablar:meaning-recall", "es:hablar"),
        isNew: true,
      },
      context,
    ).weight;
    expect(formWeight).toBeLessThan(meaningWeight * 0.02);
  });

  it("AC-8: held meaning sets form-recall staging factor to 1", () => {
    const now = Date.now();
    const context = {
      ...emptySamplingContext(now),
      meaningSuccessCountByWordId: new Map([["es:hablar", 3]]),
    };
    const formWeight = weightCandidate(
      {
        card: {
          ...baseCard(1),
          taskId: "es:hablar:hablo:form-recall",
          wordId: "es:hablar",
          back: "hablo",
        },
        task: newTask("es:hablar:hablo:form-recall", "es:hablar"),
        isNew: false,
      },
      context,
    ).weight;
    const meaningWeight = weightCandidate(
      {
        card: { ...baseCard(1), taskId: "es:hablar:meaning-recall", wordId: "es:hablar" },
        task: newTask("es:hablar:meaning-recall", "es:hablar"),
        isNew: false,
      },
      context,
    ).weight;
    expect(formWeight).toBeGreaterThanOrEqual(meaningWeight * 0.5);
  });

  it("AC-9: building a session does not mutate task due dates or reviews", () => {
    const now = Date.now();
    const card = baseCard(1);
    const reviewedAt = now - 14 * DAY_MS;
    let task = newTask(card.taskId, card.wordId);
    task = applyReview(task, "good", reviewedAt).task;
    task = applyReview(task, "good", reviewedAt + DAY_MS).task;
    const dueBefore = task.due;
    const reviewsBefore = task.reviews.length;

    buildSession([card], { [card.taskId]: task }, now, 1, {
      sampling: emptySamplingContext(now),
    });

    expect(task.due).toBe(dueBefore);
    expect(task.reviews.length).toBe(reviewsBefore);
  });

  it("AC-10: sampling reasons are categorical labels, not numeric weights", () => {
    const now = Date.now();
    const candidates = Array.from({ length: 10 }, (_, index) => ({
      card: baseCard(index + 1),
      task: newTask(`es:lemma${index + 1}:meaning-recall`, `es:lemma${index + 1}`),
      isNew: true,
    }));
    const picked = sampleSession({
      candidates,
      context: monteCarloContext(now, mulberry32(33)),
      sessionLength: 5,
    });
    for (const entry of picked) {
      expect(SAMPLING_REASONS).toContain(entry.reason);
      expect(entry.reason).not.toMatch(/\d/);
    }
  });

  it("AC-11: break return prioritises overdue urgency and frequency (T-W12)", () => {
    const now = Date.now();
    const overdueFrequent = taskAtRetrievability(0.5, now, "es:freq:meaning-recall", "es:freq");
    const overdueRare = taskAtRetrievability(0.5, now, "es:rare:meaning-recall", "es:rare");
    const frequentTask = { ...overdueFrequent, due: now - 20 * DAY_MS };
    const rareTask = { ...overdueRare, due: now - 1 * DAY_MS };

    let frequentWins = 0;
    const trials = 500;
    for (let trial = 0; trial < trials; trial += 1) {
      const picked = sampleSession({
        candidates: [
          { card: baseCard(10, "freq"), task: frequentTask, isNew: false },
          { card: baseCard(100, "rare"), task: rareTask, isNew: false },
        ],
        context: monteCarloContext(now, mulberry32(trial + 1200)),
        sessionLength: 1,
      });
      if (picked[0]?.card.lemma === "freq") frequentWins += 1;
    }
    expect(frequentWins).toBeGreaterThan(400);
  });

  it("AC-12: buildSession picks overdue backlog by urgency×frequency (T-W12)", () => {
    const now = Date.now();
    const overdueCards = Array.from({ length: 20 }, (_, index) => {
      const rank = index + 1;
      const card = baseCard(rank, `lemma${rank}`);
      let task = taskAtRetrievability(0.55, now, card.taskId, card.wordId);
      task = { ...task, due: now - (index + 1) * DAY_MS };
      return { card, task };
    });

    const session = buildSession(
      overdueCards.map((entry) => entry.card),
      Object.fromEntries(overdueCards.map((entry) => [entry.card.taskId, entry.task])),
      now,
      15,
      { sampling: emptySamplingContext(now) },
    );

    expect(session).toHaveLength(15);
    const weights = overdueCards.map((entry) =>
      weightCandidate(
        { card: entry.card, task: entry.task, isNew: false },
        emptySamplingContext(now),
      ).weight,
    );
    const maxWeight = Math.max(...weights);
    const topTaskIds = new Set(
      overdueCards
        .filter((_, index) => weights[index]! >= maxWeight * 0.95)
        .map((entry) => entry.card.taskId),
    );
    expect(topTaskIds.has(session[0]!.taskId)).toBe(true);
  });
});
