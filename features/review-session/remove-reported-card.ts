import type { SessionCard } from "@/lib/session-builder";

/**
 * Drops a reported word from the active session queue, including any requeued
 * copy of the same wordId. Renumbers position/total for the fixed-length run.
 */
export function removeReportedCardFromQueue(
  queue: SessionCard[],
  sessionIndex: number,
  wordId: string,
): { queue: SessionCard[]; nextIndex: number } {
  const filtered = queue.filter((card) => card.wordId !== wordId);
  const total = filtered.length;
  const renumbered = filtered.map((card, index) => ({
    ...card,
    position: index + 1,
    total,
  }));
  const removedBeforeCurrent = queue
    .slice(0, sessionIndex)
    .filter((card) => card.wordId === wordId).length;
  const nextIndex = sessionIndex - removedBeforeCurrent;
  return { queue: renumbered, nextIndex };
}
