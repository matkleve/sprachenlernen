/**
 * Vocabulary snapshot derivation. Contract:
 * docs/specs/service/vocabulary-snapshot.md
 *
 * Framework-free: rebuilt Tasks from the starter deck and review history.
 */

import type { StarterCard } from "@/lib/starter-deck";
import { DEFAULT_CONFIG, newTask, type Config, type Grade, type Review, type Task } from "@/lib/scheduler";

const DAY_MS = 86_400_000;
export const HORIZON_DAYS = 30;

export type VocabularyBucket = "held" | "fragile" | "new";

export type VocabularyCounts = {
  held: number;
  fragile: number;
  new: number;
};

export type HorizonBin = {
  /** 0 = today */
  dayOffset: number;
  count: number;
};

export type AtlasPoint = {
  lemma: string;
  taskId: string;
  frequencyRank: number;
  stability: number | null;
  bucket: VocabularyBucket;
  /** Held tasks at or above matureStabilityThreshold — atlas display tier only. */
  mature: boolean;
  taskState: Task["state"];
  due: number;
  lastGrade: Task["reviews"][number]["grade"] | null;
  reviewCount: number;
};

export type VocabularySnapshot = {
  counts: VocabularyCounts;
  horizon: readonly HorizonBin[];
  atlas: readonly AtlasPoint[];
};

const SUCCESS_GRADES: ReadonlySet<Review["grade"]> = new Set(["hard", "good", "easy"]);

/**
 * Held means stable enough to count as known — not merely graduated from the
 * learning phase. Graduation (~1 day) and held (~7 days) answer different
 * questions; conflating them let one `good` buy a held count (calibration
 * 2026-08-12).
 */
export function isTaskHeld(task: Task, config: Config = DEFAULT_CONFIG): boolean {
  if (task.reviews.length === 0) return false;
  if (task.state !== "review") return false;

  const stability = task.stability ?? 0;
  if (stability < config.heldStabilityThreshold) return false;

  const last = task.reviews[task.reviews.length - 1];
  if (!last || last.grade === "again") return false;

  const successes = task.reviews.filter((review) => SUCCESS_GRADES.has(review.grade)).length;
  if (successes < 2) return false;

  return true;
}

export function isTaskMature(task: Task, config: Config = DEFAULT_CONFIG): boolean {
  if (!isTaskHeld(task, config)) return false;
  return (task.stability ?? 0) >= config.matureStabilityThreshold;
}

export function bucketForTask(task: Task, config: Config = DEFAULT_CONFIG): VocabularyBucket {
  if (task.reviews.length === 0) return "new";
  if (isTaskHeld(task, config)) return "held";
  return "fragile";
}

export function buildVocabularySnapshot(
  cards: readonly StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  config: Config = DEFAULT_CONFIG,
): VocabularySnapshot {
  const counts: VocabularyCounts = { held: 0, fragile: 0, new: 0 };
  const horizon: HorizonBin[] = Array.from({ length: HORIZON_DAYS }, (_, dayOffset) => ({
    dayOffset,
    count: 0,
  }));
  const atlas: AtlasPoint[] = [];

  for (const card of cards) {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    if (task.state === "suspended" || task.state === "retired") continue;

    const bucket = bucketForTask(task, config);
    counts[bucket] += 1;

    atlas.push({
      lemma: card.lemma,
      taskId: card.taskId,
      frequencyRank: card.frequencyRank,
      stability: task.stability ?? null,
      bucket,
      mature: isTaskMature(task, config),
      taskState: task.state,
      due: task.due,
      lastGrade: task.reviews[task.reviews.length - 1]?.grade ?? null,
      reviewCount: task.reviews.length,
    });

    if (task.reviews.length > 0) {
      const dayOffset = Math.floor((task.due - now) / DAY_MS);
      if (dayOffset >= 0 && dayOffset < HORIZON_DAYS) {
        const bin = horizon[dayOffset];
        if (bin) bin.count += 1;
      }
    }
  }

  atlas.sort((a, b) => a.frequencyRank - b.frequencyRank);

  return { counts, horizon, atlas };
}
