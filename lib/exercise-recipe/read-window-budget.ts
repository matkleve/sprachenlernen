/**
 * Shared budget scaling for read-window exercise recipes.
 * Contract: docs/specs/service/method-session-budget.md
 */
import {
  READ_ALOUD_RUNNER_SEC,
  READ_ALOUD_SPEAK_SEC,
  READ_WINDOW_RUNNER_SEC,
  budgetProfileForMethod,
  readWindowDurationSec,
} from "@/lib/exercise-recipe/budget";
import type { SessionContext } from "@/lib/exercise-recipe/types";

export function extensiveReadingDurationSec(ctx: SessionContext): number | undefined {
  if (ctx.budgetMinutes === undefined) return ctx.durationSec;
  const profile = budgetProfileForMethod("extensive-reading");
  if (!profile) return ctx.durationSec;
  return readWindowDurationSec(ctx.budgetMinutes, profile, READ_WINDOW_RUNNER_SEC + 60);
}

export function readingAloudDurationSec(ctx: SessionContext): number | undefined {
  if (ctx.budgetMinutes === undefined) return ctx.durationSec;
  const profile = budgetProfileForMethod("reading-aloud");
  if (!profile) return ctx.durationSec;
  return readWindowDurationSec(
    ctx.budgetMinutes,
    profile,
    READ_ALOUD_RUNNER_SEC + READ_ALOUD_SPEAK_SEC,
  );
}
