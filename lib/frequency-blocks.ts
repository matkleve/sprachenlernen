/**
 * Frequency-block derivation. Contract: docs/specs/service/frequency-blocks.md
 */

import { bucketForTask, type VocabularyBucket } from "@/lib/vocabulary-snapshot";
import type { StarterCard } from "@/lib/starter-deck";
import { DEFAULT_CONFIG, newTask, rebuild, type Config, type Review, type Task } from "@/lib/scheduler";

export type FrequencyBlockBand = {
  rankStart: number;
  rankEnd: number;
};

export type FrequencyBlockCounts = {
  held: number;
  fragile: number;
  new: number;
};

export type FrequencyBlock = FrequencyBlockBand &
  FrequencyBlockCounts & {
    poolSize: number;
  };

/** Default bands for the shipped 2000-lemma starter pool. */
export const DEFAULT_FREQUENCY_BANDS: readonly FrequencyBlockBand[] = [
  { rankStart: 1, rankEnd: 1000 },
  { rankStart: 1001, rankEnd: 2000 },
] as const;

function taskForCard(card: StarterCard, reviews: Review[]): Task {
  if (reviews.length === 0) return newTask(card.taskId, card.wordId);
  return rebuild(card.taskId, card.wordId, reviews).task;
}

function emptyBlock(band: FrequencyBlockBand): FrequencyBlock {
  return {
    ...band,
    poolSize: 0,
    held: 0,
    fragile: 0,
    new: 0,
  };
}

function incrementBucket(block: FrequencyBlock, bucket: VocabularyBucket): void {
  block.poolSize += 1;
  block[bucket] += 1;
}

export function buildFrequencyBlocks(
  cards: readonly StarterCard[],
  reviewsByTaskId: Record<string, Review[]>,
  bands: readonly FrequencyBlockBand[] = DEFAULT_FREQUENCY_BANDS,
  config: Config = DEFAULT_CONFIG,
): FrequencyBlock[] {
  const blocks = bands.map(emptyBlock);

  for (const card of cards) {
    const bandIndex = bands.findIndex(
      (band) => card.frequencyRank >= band.rankStart && card.frequencyRank <= band.rankEnd,
    );
    if (bandIndex < 0) continue;

    const reviews = reviewsByTaskId[card.taskId] ?? [];
    const task = taskForCard(card, reviews);
    if (task.state === "suspended" || task.state === "retired") continue;

    incrementBucket(blocks[bandIndex]!, bucketForTask(task, config));
  }

  return blocks;
}
