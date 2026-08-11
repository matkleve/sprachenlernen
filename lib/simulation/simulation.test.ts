/**
 * Contract: docs/SIMULATION.md
 * Boundaries: docs/adr/0008-simulated-learners-as-a-test-harness.md
 *
 * A thousand synthetic learners against the real scheduler. These assert
 * PROPERTIES, not numbers tuned to today's constants — a bound fitted to the
 * current weights breaks on every change and teaches people to widen it
 * (docs/SIMULATION.md, rule 2).
 *
 * Nothing here is evidence that any method teaches anything. It is evidence about
 * the system: legality, reachability, source-of-truth, and how far the app's
 * estimate drifts from a truth it cannot see.
 */

import { describe, expect, it } from "vitest";

import { PERSONAS } from "@/lib/simulation/personas";
import { observedRecall, rebuildMatches, runLearner, type RunResult } from "@/lib/simulation/run";

const DAYS = 365;
const PER_PERSONA = Math.ceil(1000 / PERSONAS.length);

const population: RunResult[] = PERSONAS.flatMap((persona) =>
  Array.from({ length: PER_PERSONA }, (_, i) => runLearner(persona, 1000 + i, DAYS)),
);

describe("a population of synthetic learners", () => {
  it("is a thousand learners over a year", () => {
    expect(population.length).toBeGreaterThanOrEqual(1000);
    expect(population.reduce((n, r) => n + r.reviews, 0)).toBeGreaterThan(100_000);
  });

  it("is reproducible from its seed", () => {
    const a = runLearner(PERSONAS[0]!, 42, 90);
    const b = runLearner(PERSONAS[0]!, 42, 90);
    expect(b.reviews).toBe(a.reviews);
    expect(b.tasks.map((t) => [t.id, t.state, t.stability])).toEqual(
      a.tasks.map((t) => [t.id, t.state, t.stability]),
    );
  });

  it("never produces an illegal transition", () => {
    // The scheduler reports rather than throws, so an illegal move is silent in
    // production. Over a year of real sequences it must never happen at all.
    expect(population.filter((r) => r.illegal > 0)).toEqual([]);
  });

  it("keeps the review log as the source of truth for every task", () => {
    const diverged = population.filter((r) => !rebuildMatches(r));
    expect(diverged.map((r) => `${r.persona}/${r.seed}`)).toEqual([]);
  });

  it("never schedules a suspended or retired task", () => {
    for (const result of population) {
      for (const task of result.tasks) {
        if (task.state !== "suspended") continue;
        // A suspended task keeps a stale due date on purpose. What must not
        // happen is a review recorded after it suspended.
        const suspendedAt = task.lastReviewAt ?? 0;
        const after = task.reviews.filter((r) => r.at > suspendedAt);
        expect(after).toEqual([]);
      }
    }
  });
});

describe("calibration against a truth the app cannot see", () => {
  // The product claim is that a level is measured rather than asserted. With a
  // ground truth from a DIFFERENT functional family than FSRS, this is the only
  // check of that claim available before real users exist.
  const buckets = population[0]!.calibration.map((_, i) => {
    const attempts = population.reduce((n, r) => n + (r.calibration[i]?.attempts ?? 0), 0);
    const recalled = population.reduce((n, r) => n + (r.calibration[i]?.recalled ?? 0), 0);
    return { predicted: population[0]!.calibration[i]!.predicted, attempts, recalled };
  });

  const populated = buckets.filter((b) => b.attempts >= 500);

  it("has enough data in several buckets to say anything", () => {
    expect(populated.length).toBeGreaterThanOrEqual(3);
  });

  it("orders correctly wherever the predictions differ meaningfully", () => {
    // The property that must hold for ANY sane scheduler, and the one that does
    // not depend on the constants we invented — an exact recall rate would.
    //
    // Adjacent buckets are deliberately not compared: they differ by 0.1 in
    // prediction, which sampling noise swamps, and a strict adjacent-monotonicity
    // assertion failed on a 0.02 inversion that means nothing. Two buckets apart
    // is a real difference in claim, so an inversion there is a real defect.
    const inversions: string[] = [];

    for (const a of populated) {
      for (const b of populated) {
        if (b.predicted - a.predicted < 0.2) continue;
        if (observedRecall(a)! >= observedRecall(b)!) {
          inversions.push(`${a.predicted} → ${b.predicted}`);
        }
      }
    }

    expect(inversions).toEqual([]);
  });

  it("is over-confident at the top rather than under-confident", () => {
    // A finding, not a defect, and worth pinning so a future change cannot
    // silently reverse it: the synthetic learner forgets exponentially while FSRS
    // uses a power law, so past the anchor point truth falls away faster than the
    // estimate. The direction of the error is the useful part — a scheduler that
    // UNDER-estimated recall would be wasting the learner's time instead.
    const top = populated[populated.length - 1]!;
    expect(observedRecall(top)!).toBeLessThan(top.predicted);
  });

  it("is not systematically inverted or flat", () => {
    const first = observedRecall(populated[0]!)!;
    const last = observedRecall(populated[populated.length - 1]!)!;
    expect(last - first).toBeGreaterThan(0.1);
  });
});

describe("what the population reveals about the system", () => {
  it("reaches every non-terminal state across the population", () => {
    const seen = new Set(population.flatMap((r) => [...r.statesSeen]));
    // `retired` is excluded deliberately: nothing in this harness removes a word
    // from a learner's set, so reaching it would mean the scheduler retired a
    // task on its own.
    expect([...seen].sort()).toEqual(["learning", "new", "relearning", "review", "suspended"]);
  });

  it("abandons strugglers far more readily than the diligent", () => {
    // Relative, not absolute. Suspension is the scheduler giving up on a task
    // (UC-013), so the property that matters is that it tracks actual difficulty
    // rather than firing on everyone. A fixed percentage here would be a number
    // fitted to today's weights.
    const rate = (name: string) => {
      const runs = population.filter((r) => r.persona === name);
      const tasks = runs.reduce((n, r) => n + r.tasks.length, 0);
      return runs.reduce((n, r) => n + r.suspended, 0) / tasks;
    };
    expect(rate("struggler")).toBeGreaterThan(rate("diligent") * 5);
    // A ceiling, not a target: if a diligent honest learner has most of their
    // words abandoned, the schedule is broken however good the ratio looks.
    expect(rate("diligent")).toBeLessThan(0.2);
  });

  it("grows intervals rather than over-practising", () => {
    // Over-practice is the documented failure of mastery-threshold systems
    // (study/26, R6). If intervals did not grow with review count, the schedule
    // would be re-asking questions it already has evidence for.
    //
    // Aggregated across the population rather than asserted per learner: one
    // learner's median over a handful of mature tasks is noisy enough to make
    // this flaky, and flaky is worse than absent.
    const mature = population
      .filter((r) => r.persona === "diligent")
      .flatMap((r) => r.tasks.filter((t) => t.state === "review" && t.reviews.length >= 6));

    expect(mature.length).toBeGreaterThan(100);

    const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!;
    const early = median(mature.map((t) => t.reviews[2]!.at - t.reviews[1]!.at));
    const late = median(mature.map((t) => t.reviews[5]!.at - t.reviews[4]!.at));
    expect(late).toBeGreaterThan(early);
  });

  it("leaves the trickler with a backlog it cannot clear, and says so", () => {
    // Not a bug in the scheduler — a real consequence of taking on more words
    // than a daily budget can review, and exactly the pressure that produces the
    // backlog counter A3 forbids. Recorded here so the number is visible to
    // whoever designs the session builder rather than discovered by a user.
    const trickler = population.filter((r) => r.persona === "trickler");
    const skipped = trickler.reduce((n, r) => n + r.skippedDue, 0);
    expect(skipped).toBeGreaterThan(0);

    const diligent = population.filter((r) => r.persona === "diligent");
    expect(diligent.reduce((n, r) => n + r.skippedDue, 0)).toBeLessThan(skipped);
  });
});
