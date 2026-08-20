/**
 * Pull non-due form cells forward when mixing rules cannot be met. Contract:
 * docs/specs/service/form-practice.md (session composition rule 4)
 */

import { mixFormSession, paradigmMixingKey, type LemmaMeta } from "@/lib/form-session-mixing";
import type { StarterCard } from "@/lib/starter-deck";
import type { Task } from "@/lib/scheduler";

export type BuildFormSessionWithPullForwardInput = {
  dueCards: readonly StarterCard[];
  reserveCards: readonly StarterCard[];
  sessionLength: number;
  lemmaMeta: LemmaMeta;
  tasksByTaskId: Record<string, Task>;
  now: number;
};

function satisfiesMixingRules(cards: readonly StarterCard[], lemmaMeta: LemmaMeta): boolean {
  for (let index = 1; index < cards.length; index += 1) {
    if (cards[index]!.lemma === cards[index - 1]!.lemma) return false;
  }

  for (let start = 0; start <= cards.length - 4; start += 1) {
    const window = cards.slice(start, start + 4);
    const counts = new Map<string, number>();
    for (const entry of window) {
      const key = paradigmMixingKey(entry.lemma, entry.paradigmCell ?? "", lemmaMeta);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (Math.max(...counts.values(), 0) > 2) return false;
  }

  return true;
}

function sortReserve(cards: readonly StarterCard[], tasksByTaskId: Record<string, Task>, now: number) {
  return [...cards].sort((left, right) => {
    const leftDue = tasksByTaskId[left.taskId]?.due ?? Number.MAX_SAFE_INTEGER;
    const rightDue = tasksByTaskId[right.taskId]?.due ?? Number.MAX_SAFE_INTEGER;
    const leftDistance = Math.abs(leftDue - now);
    const rightDistance = Math.abs(rightDue - now);
    return leftDistance - rightDistance || left.frequencyRank - right.frequencyRank;
  });
}

/**
 * Builds a form session long enough to mix cleanly, pulling reserve cards forward
 * when the due set alone would violate lemma or tense×class spacing.
 */
export function buildFormSessionWithPullForward(
  input: BuildFormSessionWithPullForwardInput,
): StarterCard[] {
  const { dueCards, reserveCards, sessionLength, lemmaMeta, tasksByTaskId, now } = input;
  const reserve = sortReserve(reserveCards, tasksByTaskId, now).filter(
    (card) => !dueCards.some((due) => due.taskId === card.taskId),
  );

  let pool = [...dueCards];
  const targetLength = Math.max(sessionLength, dueCards.length);

  while (pool.length < targetLength && reserve.length > 0) {
    pool.push(reserve.shift()!);
  }

  while (pool.length <= targetLength && reserve.length > 0) {
    const mixed = mixFormSession(pool, { lemmaMeta });
    if (mixed.length >= sessionLength && satisfiesMixingRules(mixed, lemmaMeta)) {
      return mixed.slice(0, sessionLength);
    }
    pool.push(reserve.shift()!);
  }

  const mixed = mixFormSession(pool, { lemmaMeta });
  if (mixed.length >= sessionLength) {
    return mixed.slice(0, sessionLength);
  }

  while (mixed.length < sessionLength && reserve.length > 0) {
    mixed.push(reserve.shift()!);
  }

  return mixFormSession(mixed, { lemmaMeta }).slice(0, sessionLength);
}
