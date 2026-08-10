/**
 * Discrete time budget for the method menu slider.
 * Contract: docs/specs/page/method-menu.md
 *
 * Linear minute steps fail two learner needs: someone with five minutes must
 * not fight a slider built for an hour, and someone with an afternoon should not
 * click sixty times. Steps are dense at the low end, sparse at the top, then
 * "endless" drops the ceiling entirely (UC-048).
 */

/** Minutes per step, ascending. Dense below 15, sparse up to one day. */
export const TIME_SCALE_MINUTES = [
  2, 3, 5, 7, 10, 12, 15,
  20, 25, 30, 40, 50,
  60, 90, 120,
  180, 240,
  360, 480, 720,
  1440,
] as const;

export type ScaleMinutes = (typeof TIME_SCALE_MINUTES)[number];
export type TimeBudget = ScaleMinutes | "endless";

export const DEFAULT_TIME_BUDGET: ScaleMinutes = 15;

export const TIME_SCALE_STEP_COUNT = TIME_SCALE_MINUTES.length + 1;

export function isEndless(budget: TimeBudget): budget is "endless" {
  return budget === "endless";
}

export function stepIndexFromBudget(budget: TimeBudget): number {
  if (isEndless(budget)) return TIME_SCALE_MINUTES.length;
  const index = TIME_SCALE_MINUTES.indexOf(budget);
  return index >= 0 ? index : closestStepIndex(budget);
}

export function budgetFromStepIndex(index: number): TimeBudget {
  const clamped = Math.min(Math.max(0, index), TIME_SCALE_MINUTES.length);
  if (clamped === TIME_SCALE_MINUTES.length) return "endless";
  return TIME_SCALE_MINUTES[clamped]!;
}

/** Snap an arbitrary minute value to the nearest scale step (for legacy URLs). */
export function snapMinutes(minutes: number): ScaleMinutes {
  return TIME_SCALE_MINUTES[closestStepIndex(minutes)]!;
}

function closestStepIndex(minutes: number): number {
  let best = 0;
  let bestDistance = Math.abs(TIME_SCALE_MINUTES[0]! - minutes);
  for (let i = 1; i < TIME_SCALE_MINUTES.length; i++) {
    const distance = Math.abs(TIME_SCALE_MINUTES[i]! - minutes);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}

export function parseTimeBudgetParam(raw: string | undefined): TimeBudget | undefined {
  if (raw === undefined) return undefined;
  if (raw === "endless") return "endless";
  const minutes = Number(raw);
  if (Number.isNaN(minutes) || minutes < TIME_SCALE_MINUTES[0]!) return undefined;
  if (minutes > TIME_SCALE_MINUTES[TIME_SCALE_MINUTES.length - 1]!) return "endless";
  return snapMinutes(minutes);
}

export function timeBudgetToParam(budget: TimeBudget): string {
  return isEndless(budget) ? "endless" : String(budget);
}
