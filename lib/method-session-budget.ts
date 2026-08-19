/**
 * Resolve learner session budget from menu URL + catalogue durations.
 * Contract: docs/specs/service/method-session-budget.md
 */
import type { MethodEntry } from "@/lib/method-catalogue";
import { isEndless, parseTimeBudgetParam } from "@/lib/time-scale";

export function resolveSessionBudgetMinutes(
  durations: MethodEntry["durations"],
  rawMinutes?: string | undefined,
): number | undefined {
  if (durations === null || durations.length === 0) return undefined;

  const min = Math.min(...durations);
  const max = Math.max(...durations);

  const parsed = rawMinutes ? parseTimeBudgetParam(rawMinutes) : undefined;
  if (parsed === undefined || isEndless(parsed)) {
    return min;
  }

  return Math.min(max, Math.max(min, parsed));
}

export function appendBudgetMinutesParam(
  params: URLSearchParams,
  budgetMinutes: number | undefined,
): void {
  if (budgetMinutes !== undefined) {
    params.set("minutes", String(budgetMinutes));
  }
}
