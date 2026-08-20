/**
 * Target-word selection for production methods (build-a-sentence).
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
import { isMeaningRecallTaskId } from "@/lib/form-recall-pool";
import { englishGlossForCard, type StarterCard } from "@/lib/starter-deck";

export type SentenceTarget = {
  taskId: string;
  lemma: string;
  /** Surface form the learner should use in the sentence. */
  word: string;
  gloss: string;
};

const LEARNING_RANK_MIN = 10;
const LEARNING_RANK_MAX = 500;

export type ProductionHints = {
  sourceId: string;
  promptIndex: number;
  optionalWords: Array<{ word: string; gloss: string }>;
};

const MAX_OPTIONAL_WORDS = 3;

export function pickProductionHints(
  cards: readonly StarterCard[],
  heldLemmas: ReadonlySet<string> = new Set(),
): ProductionHints {
  const meaningCards = cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  const held = meaningCards
    .filter((card) => heldLemmas.has(card.lemma))
    .sort((left, right) => left.frequencyRank - right.frequencyRank)
    .slice(0, MAX_OPTIONAL_WORDS);

  const optionalWords = held.map((card) => ({
    word: card.front,
    gloss: englishGlossForCard(card),
  }));

  const seedLemma = held[0]?.lemma ?? meaningCards[0]?.lemma ?? "free-production";
  const promptIndex = seedLemma.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    sourceId: held[0]?.taskId ?? "free-production",
    promptIndex,
    optionalWords,
  };
}

function meaningRecallCandidates(
  cards: readonly StarterCard[],
  heldLemmas: ReadonlySet<string>,
): StarterCard[] {
  const meaningCards = cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  if (meaningCards.length === 0) return [];

  const held = meaningCards.filter((card) => heldLemmas.has(card.lemma));
  const learningBand = meaningCards.filter(
    (card) =>
      card.frequencyRank >= LEARNING_RANK_MIN && card.frequencyRank <= LEARNING_RANK_MAX,
  );
  return held.length > 0 ? held : learningBand.length > 0 ? learningBand : meaningCards;
}

export function pickSentenceTarget(
  cards: readonly StarterCard[],
  heldLemmas: ReadonlySet<string> = new Set(),
): SentenceTarget | null {
  const sorted = [...meaningRecallCandidates(cards, heldLemmas)].sort(
    (left, right) => left.frequencyRank - right.frequencyRank,
  );
  const card = sorted[0];
  if (!card) return null;

  return {
    taskId: card.taskId,
    lemma: card.lemma,
    word: card.front,
    gloss: englishGlossForCard(card),
  };
}

/** Distinct lemmas, frequency order — used by build-a-sentence batch compose. */
export function pickSentenceTargets(
  cards: readonly StarterCard[],
  heldLemmas: ReadonlySet<string> = new Set(),
  count: number,
): SentenceTarget[] {
  if (count < 1) return [];

  const sorted = [...meaningRecallCandidates(cards, heldLemmas)].sort(
    (left, right) => left.frequencyRank - right.frequencyRank,
  );

  const seen = new Set<string>();
  const targets: SentenceTarget[] = [];

  for (const card of sorted) {
    if (seen.has(card.lemma)) continue;
    seen.add(card.lemma);
    targets.push({
      taskId: card.taskId,
      lemma: card.lemma,
      word: card.front,
      gloss: englishGlossForCard(card),
    });
    if (targets.length >= count) break;
  }

  return targets;
}
