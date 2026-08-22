/**
 * K4 session loop payoff — newly held lemmas and coverage deltas on sources.
 * Contract: docs/specs/feature/content-traceability.md (T-W11)
 */
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import {
  computeCoverage,
  sourceText,
  type Source,
} from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { applyReview, newTask, type Grade, type Task } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import { isTaskHeld } from "@/lib/vocabulary-snapshot";

export type SessionGrade = {
  taskId: string;
  grade: Grade;
  reviewedAtMs: number;
};

export type SourceCoverageDelta = {
  id: string;
  title: string;
  beforePercent: number;
  afterPercent: number;
};

export type SessionLoopPayoff =
  | { kind: "none" }
  | {
      kind: "payoff";
      newlyHeldCount: number;
      newlyHeldLemmas: readonly string[];
      sourceDeltas: readonly SourceCoverageDelta[];
      linkTarget: "words" | "content";
    };

export function computeSessionLoopPayoff(
  meaningCards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
  heldLemmasAtStart: ReadonlySet<string>,
  sessionGrades: readonly SessionGrade[],
  sources: readonly Source[],
  lexicon: Lexicon,
): SessionLoopPayoff {
  const tasks = new Map(
    meaningCards.map((card) => [
      card.taskId,
      tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId),
    ]),
  );
  const heldBeforeTask = new Map<string, boolean>();
  const newlyHeldLemmas = new Set<string>();

  const sortedGrades = [...sessionGrades].sort((a, b) => a.reviewedAtMs - b.reviewedAtMs);
  for (const review of sortedGrades) {
    if (!isMeaningRecallTaskId(review.taskId)) continue;
    const card = meaningCards.find((entry) => entry.taskId === review.taskId);
    if (!card) continue;

    const task = tasks.get(review.taskId)!;
    const wasHeld = heldBeforeTask.get(review.taskId) ?? isTaskHeld(task);
    const result = applyReview(task, review.grade, review.reviewedAtMs);
    tasks.set(review.taskId, result.task);
    const nowHeld = isTaskHeld(result.task);
    heldBeforeTask.set(review.taskId, nowHeld);
    if (!wasHeld && nowHeld) newlyHeldLemmas.add(card.lemma);
  }

  if (newlyHeldLemmas.size === 0) return { kind: "none" };

  const heldAfter = new Set(heldLemmasAtStart);
  for (const lemma of newlyHeldLemmas) heldAfter.add(lemma);

  const sourceDeltas: SourceCoverageDelta[] = [];
  for (const source of sources) {
    if (source.ephemeral) continue;
    const text = sourceText(source);
    if (!text.trim()) continue;

    const before = computeCoverage(text, lexicon, heldLemmasAtStart);
    const after = computeCoverage(text, lexicon, heldAfter);
    if (after.coveragePercent > before.coveragePercent) {
      sourceDeltas.push({
        id: source.id,
        title: source.title,
        beforePercent: before.coveragePercent,
        afterPercent: after.coveragePercent,
      });
    }
  }

  return {
    kind: "payoff",
    newlyHeldCount: newlyHeldLemmas.size,
    newlyHeldLemmas: [...newlyHeldLemmas].sort(),
    sourceDeltas,
    linkTarget: sourceDeltas.length > 0 ? "content" : "words",
  };
}
