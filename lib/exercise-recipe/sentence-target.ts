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

export function pickSentenceTarget(
  cards: readonly StarterCard[],
  heldLemmas: ReadonlySet<string> = new Set(),
): SentenceTarget | null {
  const meaningCards = cards.filter((card) => isMeaningRecallTaskId(card.taskId));
  if (meaningCards.length === 0) return null;

  const held = meaningCards.filter((card) => heldLemmas.has(card.lemma));
  const learningBand = meaningCards.filter(
    (card) =>
      card.frequencyRank >= LEARNING_RANK_MIN && card.frequencyRank <= LEARNING_RANK_MAX,
  );
  const candidates = held.length > 0 ? held : learningBand.length > 0 ? learningBand : meaningCards;

  const sorted = [...candidates].sort((left, right) => left.frequencyRank - right.frequencyRank);
  const card = sorted[0];
  if (!card) return null;

  return {
    taskId: card.taskId,
    lemma: card.lemma,
    word: card.front,
    gloss: englishGlossForCard(card),
  };
}
