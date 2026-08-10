/**
 * Vocabulary snapshot derivation. Contract:
 * docs/specs/service/vocabulary-snapshot.md
 *
 * Framework-free: rebuilt Tasks from the starter deck and review history.
 */

import type { StarterCard } from "@/lib/starter-deck";
import {
  DEFAULT_CONFIG,
  newTask,
  rebuild,
  type Config,
  type Review,
  type Task,
} from "@/lib/scheduler";

const DAY_MS = 86_400_000;
export const HORIZON_DAYS = 30;

export type VocabularyBucket = "held" | "shaky" | "new";

export type VocabularyCounts = {
  held: number;
  shaky: number;
  new: number;
};

export type HorizonBin = {
  /** 0 = today */
  dayOffset: number;
  count: number;
};

export type AtlasPoint = {
  lemma: string;
  frequencyRank: number;
  stability: number | null;
  bucket: VocabularyBucket;
};

export type VocabularySnapshot = {
  counts: VocabularyCounts;
  horizon: readonly HorizonBin[];
  atlas: readonly AtlasPoint[];
};

function taskForCard(card: StarterCard, reviews: Review[]): Task {
  if (reviews.length === 0) return newTask(card.taskId, card.wordId);
  return rebuild(card.taskId, card.wordId, reviews).task;
}

/** Held means stability above the graduation threshold — study/04 G3. */
export function bucketForTask(task: Task, config: Config = DEFAULT_CONFIG): VocabularyBucket {
  if (task.reviews.length === 0) return "new";
  const stability = task.stability ?? 0;
  if (stability > config.graduationStability) return "held";
  return "shaky";
}

export function buildVocabularySnapshot(
  cards: readonly StarterCard[],
  reviewsByTaskId: Record<string, Review[]>,
  now: number,
  config: Config = DEFAULT_CONFIG,
): VocabularySnapshot {
  const counts: VocabularyCounts = { held: 0, shaky: 0, new: 0 };
  const horizon: HorizonBin[] = Array.from({ length: HORIZON_DAYS }, (_, dayOffset) => ({
    dayOffset,
    count: 0,
  }));
  const atlas: AtlasPoint[] = [];

  for (const card of cards) {
    const reviews = reviewsByTaskId[card.taskId] ?? [];
    const task = taskForCard(card, reviews);
    if (task.state === "suspended" || task.state === "retired") continue;

    const bucket = bucketForTask(task, config);
    counts[bucket] += 1;

    atlas.push({
      lemma: card.lemma,
      frequencyRank: card.frequencyRank,
      stability: task.stability ?? null,
      bucket,
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
