/**
 * Contract: docs/specs/service/method-session-budget.md (T-MV5)
 */
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { resolveExerciseRecipe } from "@/lib/exercise-recipe";
import {
  budgetProfileForMethod,
  cardCountForBudgetMinutes,
  estimateWallClockSec,
  isWithinBudgetTolerance,
} from "@/lib/exercise-recipe/budget";
import type { MethodEntry } from "@/lib/method-catalogue";
import { usesExerciseRunner, usesWordsReview } from "@/lib/method-session";

const { catalogue } = loadMethodCatalogue();

/** Until read-window scaling ships — CI blocks new G7 failures only. */
const KNOWN_CATALOGUE_G7_FAILURES: Partial<Record<string, readonly number[]>> = {
  "full-dictation": [25],
  "reading-aloud": [5],
};

function hostedRunnableMethods(): MethodEntry[] {
  return catalogue!.entries.filter(
    (entry): entry is MethodEntry =>
      entry.type === "method" &&
      entry.hosted &&
      entry.durations !== null &&
      (usesExerciseRunner(entry) || usesWordsReview(entry)),
  );
}

describe("catalogue budget gate (T-MV5)", () => {
  for (const method of hostedRunnableMethods()) {
    for (const budgetMinutes of method.durations ?? []) {
      it(`${method.id} at ${budgetMinutes} min matches G7 allowlist or passes`, async () => {
        const allowed = KNOWN_CATALOGUE_G7_FAILURES[method.id]?.includes(budgetMinutes) ?? false;

        if (usesWordsReview(method)) {
          const wallSec =
            60 + cardCountForBudgetMinutes(budgetMinutes) * 35;
          const ok = isWithinBudgetTolerance(wallSec, budgetMinutes);
          if (allowed) expect(ok).toBe(false);
          else expect(ok).toBe(true);
          return;
        }

        const recipe = await resolveExerciseRecipe(method.id, { budgetMinutes });
        expect(recipe).not.toBeNull();

        const profile = budgetProfileForMethod(method.id);
        const wallSec = estimateWallClockSec(recipe!, profile);
        const ok = isWithinBudgetTolerance(wallSec, budgetMinutes);

        if (allowed) {
          expect(ok).toBe(false);
          return;
        }

        expect(ok, `${method.id}@${budgetMinutes}min wall=${Math.round(wallSec / 60)}`).toBe(true);
      });
    }
  }
});
