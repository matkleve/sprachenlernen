/**
 * Human-readable schedule lines for word detail. Contract:
 * docs/specs/feature/word-detail.md
 */

import type { Grade, TaskState } from "@/lib/scheduler";

const DAY_MS = 86_400_000;

export type ScheduleReasonInput = {
  state: TaskState;
  due: number;
  lastGrade: Grade | null;
  reviewCount: number;
};

export type ScheduleReasonKind =
  | "new"
  | "suspended"
  | "retired"
  | "dueToday"
  | "dueFuture";

export type ScheduleReason = {
  kind: ScheduleReasonKind;
  daysUntilDue?: number;
  lastGrade?: Grade;
};

function startOfUtcDay(ms: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function buildScheduleReason(
  input: ScheduleReasonInput,
  now: number,
): ScheduleReason {
  if (input.reviewCount === 0 || input.state === "new") {
    return { kind: "new" };
  }
  if (input.state === "suspended") {
    return { kind: "suspended" };
  }
  if (input.state === "retired") {
    return { kind: "retired" };
  }

  const daysUntilDue = Math.max(
    0,
    Math.round((startOfUtcDay(input.due) - startOfUtcDay(now)) / DAY_MS),
  );
  const lastGrade = input.lastGrade ?? undefined;

  if (daysUntilDue === 0) {
    return { kind: "dueToday", lastGrade };
  }

  return { kind: "dueFuture", daysUntilDue, lastGrade };
}
