/**
 * Resolve description text for a pool card in the spoken language.
 * Contract: docs/specs/service/gloss-resolver.md
 */
import {
  descriptionKeyForTaskId,
  taskTypeFromTaskId,
} from "@/lib/description-keys";
import { resolveDescription, resolveDescriptions } from "@/lib/gloss-resolver";
import type { SessionCard } from "@/lib/session-builder";
import { englishGlossForCard, type StarterCard } from "@/lib/starter-deck";

export function inlineDescriptionFallback(card: StarterCard): string {
  return englishGlossForCard(card);
}

export function resolveCardDescription(card: StarterCard, spokenLanguage: string): string {
  const key = card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId);
  return resolveDescription(key, spokenLanguage, inlineDescriptionFallback(card));
}

export function glossMapForLemmaCards(
  cards: readonly StarterCard[],
  spokenLanguage: string,
): Readonly<Record<string, string>> {
  const keys = cards.map((card) => card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId));
  const fallbacks = Object.fromEntries(
    cards.map((card) => {
      const key = card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId);
      return [key, inlineDescriptionFallback(card)];
    }),
  );
  const resolved = resolveDescriptions(keys, spokenLanguage, fallbacks);

  const map: Record<string, string> = {};
  for (const card of cards) {
    const key = card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId);
    map[card.lemma] = resolved[key] ?? inlineDescriptionFallback(card);
  }
  return map;
}

export function localizeSessionCard(card: SessionCard, spokenLanguage: string): SessionCard {
  return localizeSessionCards([card], spokenLanguage)[0]!;
}

export function localizeSessionCards(
  cards: readonly SessionCard[],
  spokenLanguage: string,
): SessionCard[] {
  if (cards.length === 0) return [];

  const keys = cards.map((card) => card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId));
  const fallbacks = Object.fromEntries(
    cards.map((card) => {
      const key = card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId);
      return [key, inlineDescriptionFallback(card)];
    }),
  );
  const resolved = resolveDescriptions(keys, spokenLanguage, fallbacks);

  return cards.map((card) => {
    const taskType = taskTypeFromTaskId(card.taskId);
    const key = card.descriptionKey ?? descriptionKeyForTaskId(card.wordId, card.taskId);
    const text = resolved[key] ?? inlineDescriptionFallback(card);
    if (taskType === "meaning-recall") {
      return { ...card, back: text };
    }
    if (taskType === "form-recall") {
      return { ...card, front: text };
    }
    return card;
  });
}
