import { describe, expect, it } from "vitest";

import { emptySamplingContext } from "@/lib/sampling-context";
import { applyReview, newTask, retrievability } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import {
  DEFAULT_SAMPLING_CONFIG,
  sampleSession,
  weightCandidate,
} from "@/lib/session-sampling";

const baseCard = (rank: number): StarterCard => ({
  taskId: `es:lemma${rank}:meaning-recall`,
  wordId: `es:lemma${rank}`,
  lemma: `lemma${rank}`,
  front: `lemma${rank}`,
  descriptionKey: `word.es.lemma${rank}`,
  frequencyRank: rank,
});

describe("session-sampling", () => {
  it("favours lower retrievability in weight", () => {
    const now = Date.now();
    const reviewedAt = now - 7 * 86_400_000;
    let low = newTask("es:a:meaning-recall", "es:a");
    let high = newTask("es:b:meaning-recall", "es:b");
    low = applyReview(low, "good", reviewedAt).task;
    low = applyReview(low, "good", reviewedAt + 86_400_000).task;
    high = applyReview(high, "good", reviewedAt).task;
    high = applyReview(high, "easy", reviewedAt + 86_400_000).task;
    high = applyReview(high, "easy", reviewedAt + 2 * 86_400_000).task;

    const context = emptySamplingContext(now);
    const lowWeight = weightCandidate(
      { card: baseCard(1), task: low, isNew: false },
      context,
    ).weight;
    const highWeight = weightCandidate(
      { card: baseCard(2), task: high, isNew: false },
      context,
    ).weight;
    expect(retrievability(low, now)).toBeLessThan(retrievability(high, now));
    expect(lowWeight).toBeGreaterThan(highWeight);
  });

  it("boosts tasks graded again today over good today at equal R", () => {
    const now = Date.now();
    const reviewedAt = now - 3 * 86_400_000;
    let againTask = newTask("es:a:meaning-recall", "es:a");
    let goodTask = newTask("es:b:meaning-recall", "es:b");
    againTask = applyReview(againTask, "good", reviewedAt).task;
    goodTask = applyReview(goodTask, "good", reviewedAt).task;
    againTask = applyReview(againTask, "again", now - 60_000).task;
    goodTask = applyReview(goodTask, "good", now - 60_000).task;

    const context = {
      ...emptySamplingContext(now),
      gradesTodayByTaskId: new Map([
        [againTask.id, "again" as const],
        [goodTask.id, "good" as const],
      ]),
      reviewCountByTaskId: new Map([
        [againTask.id, 2],
        [goodTask.id, 2],
      ]),
    };

    const againWeight = weightCandidate(
      { card: baseCard(1), task: againTask, isNew: false },
      context,
    ).weight;
    const goodWeight = weightCandidate(
      { card: baseCard(2), task: goodTask, isNew: false },
      context,
    ).weight;
    expect(againWeight).toBeGreaterThan(goodWeight);
  });

  it("throttles new cards after many first reviews today", () => {
    const now = Date.now();
    const context = emptySamplingContext(now);
    context.newFirstReviewCountToday = 8;
    const throttled = weightCandidate(
      { card: baseCard(1), task: newTask("es:a:meaning-recall", "es:a"), isNew: true },
      context,
    ).weight;
    const fresh = weightCandidate(
      { card: baseCard(2), task: newTask("es:b:meaning-recall", "es:b"), isNew: true },
      { ...context, newFirstReviewCountToday: 0 },
    ).weight;
    expect(throttled).toBeLessThan(fresh);
  });

  it("draws L distinct cards without replacement", () => {
    const now = Date.now();
    const candidates = Array.from({ length: 20 }, (_, index) => ({
      card: baseCard(index + 1),
      task: newTask(`es:lemma${index + 1}:meaning-recall`, `es:lemma${index + 1}`),
      isNew: true,
    }));
    let seed = 0;
    const picked = sampleSession({
      candidates,
      context: emptySamplingContext(now, () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      }),
      sessionLength: 15,
    });
    expect(picked).toHaveLength(15);
    expect(new Set(picked.map((entry) => entry.card.taskId)).size).toBe(15);
  });

  it("keeps form-recall weight near zero until meaning has successes", () => {
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

  it("uses epsilon floor from config", () => {
    const now = Date.now();
    const context = emptySamplingContext(now);
    context.config = { ...DEFAULT_SAMPLING_CONFIG, epsilon: 0.01 };
    const weight = weightCandidate(
      {
        card: baseCard(99),
        task: newTask("es:z:meaning-recall", "es:z"),
        isNew: true,
      },
      context,
    ).weight;
    expect(weight).toBeGreaterThanOrEqual(0.01);
  });
});
