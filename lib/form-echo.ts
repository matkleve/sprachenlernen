/**
 * Form-practice echo rule — confusable cell twin reinsertion. Contract:
 * docs/specs/service/form-practice.md (session composition §3).
 */

import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import type { SessionCard } from "@/lib/session-builder";

/** Same person/number, pres ↔ pret — the minimal pair the spec names. */
export function confusableTwinCell(cell: string): string | null {
  const segments = cell.split(".");
  const person = segments[segments.length - 1] ?? "";
  if (!/^[123](?:sg|pl)$/.test(person)) return null;

  const moodTense = segments.slice(0, -1).join(".");
  if (moodTense === "ind.pres") return `ind.pret.${person}`;
  if (moodTense === "ind.pret") return `ind.pres.${person}`;
  if (moodTense === "ind.impf") return `ind.pret.${person}`;
  return null;
}

export type EchoPlan = {
  /** Index in the queue to insert the twin card (after splicing it out). */
  insertAt: number;
  /** Queue index of the twin card to move. */
  fromIndex: number;
};

/**
 * When a form-recall card is graded, move its confusable twin 2–5 slots ahead
 * if that twin is still waiting in the queue. Returns null when no echo applies.
 */
export function planFormEcho(
  queue: readonly SessionCard[],
  sessionIndex: number,
  rng: () => number = Math.random,
): EchoPlan | null {
  const current = queue[sessionIndex];
  if (!current || !isFormRecallTaskId(current.taskId) || !current.paradigmCell) {
    return null;
  }

  const twinCell = confusableTwinCell(current.paradigmCell);
  if (!twinCell) return null;

  const fromIndex = queue.findIndex(
    (card, index) =>
      index > sessionIndex &&
      card.lemma === current.lemma &&
      card.paradigmCell === twinCell &&
      card.taskId !== current.taskId,
  );
  if (fromIndex < 0) return null;

  const offset = 2 + Math.floor(rng() * 4);
  const insertAt = Math.min(sessionIndex + 1 + offset, queue.length - 1);
  if (insertAt === fromIndex) return null;

  return { insertAt, fromIndex };
}

/** Apply a planned echo by moving one card within the queue. */
export function applyFormEcho(queue: readonly SessionCard[], plan: EchoPlan): SessionCard[] {
  const next = [...queue];
  const [twin] = next.splice(plan.fromIndex, 1);
  if (!twin) return next;

  let insertAt = plan.insertAt;
  if (plan.fromIndex < insertAt) insertAt -= 1;
  next.splice(insertAt, 0, twin);
  return next;
}
