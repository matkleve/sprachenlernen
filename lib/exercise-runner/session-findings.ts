/**
 * What the in-step checks found across one session. Contract:
 * docs/specs/feature/exercise-runner.md
 *
 * The one place a step reads answers other than its own, and only a `decide`
 * step may: a closing step is *about* the session, so denying it the session
 * would mean the recap has to be assembled somewhere that knows even less.
 * Reading only — nothing here writes back.
 */
import type { FindingCategory } from "@/lib/sentence-check";

import type { ExerciseRunnerState, StepAnswer } from "./types";

export type CategoryCount = { category: FindingCategory; count: number };

export type SessionFindings = {
  /** Steps whose check actually returned a result. */
  checked: number;
  /** Of those, how many came back with nothing found. */
  clean: number;
  /** Steps where the check could not run at all. */
  unavailable: number;
  /** Descending by count, then by category name so the order is stable. */
  byCategory: CategoryCount[];
  /** The flagged words themselves, in the order they were written, deduped. */
  words: string[];
};

export const NO_SESSION_FINDINGS: SessionFindings = {
  checked: 0,
  clean: 0,
  unavailable: 0,
  byCategory: [],
  words: [],
};

function answersInOrder(state: ExerciseRunnerState): StepAnswer[] {
  return state.recipe.steps
    .map((step) => state.stepAnswers[step.id])
    .filter((answer): answer is StepAnswer => answer !== undefined);
}

export function summariseSessionFindings(state: ExerciseRunnerState): SessionFindings {
  const counts = new Map<FindingCategory, number>();
  const words: string[] = [];
  const seen = new Set<string>();
  let checked = 0;
  let clean = 0;
  let unavailable = 0;

  for (const answer of answersInOrder(state)) {
    if (answer.check.phase !== "checked") continue;
    const result = answer.check.result;

    if (result.status === "unavailable") {
      unavailable += 1;
      continue;
    }

    checked += 1;
    if (result.findings.length === 0) {
      clean += 1;
      continue;
    }

    for (const finding of result.findings) {
      counts.set(finding.category, (counts.get(finding.category) ?? 0) + 1);

      const token = result.tokens[finding.tokenIndex];
      if (!token) continue;
      // Deduped case-insensitively: the same slip in two sentences is one thing
      // to work on, not two.
      const key = token.text.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      words.push(token.text);
    }
  }

  return {
    checked,
    clean,
    unavailable,
    byCategory: [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
    words,
  };
}
