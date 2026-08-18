/**
 * Resolve description text for a pool card in the spoken language.
 * Contract: docs/specs/service/gloss-resolver.md
 */
import {
  descriptionFaceForTaskType,
  descriptionKeyForTaskId,
  taskTypeFromTaskId,
} from "@/lib/description-keys";
import { resolveDescription, resolveDescriptions } from "@/lib/gloss-resolver";
import type { SessionCard } from "@/lib/session-builder";
import type { StarterCard } from "@/lib/starter-deck";

export function inlineDescriptionFallback(card: StarterCard): string {
  const face = descriptionFaceForTaskType(taskTypeFromTaskId(card.taskId));
  return face === "back" ? card.back : card.front;
}

export function resolveCardDescription(card: StarterCard, spokenLanguage: string): string {
  const key = descriptionKeyForTaskId(card.wordId, card.taskId);
  return resolveDescription(key, spokenLanguage, inlineDescriptionFallback(card));
}

export function glossMapForLemmaCards(
  cards: readonly StarterCard[],
  spokenLanguage: string,
): Readonly<Record<string, string>> {
  const keys = cards.map((card) => descriptionKeyForTaskId(card.wordId, card.taskId));
  const fallbacks = Object.fromEntries(
    cards.map((card) => [
      descriptionKeyForTaskId(card.wordId, card.taskId),
      inlineDescriptionFallback(card),
    ]),
  );
  const resolved = resolveDescriptions(keys, spokenLanguage, fallbacks);

  const map: Record<string, string> = {};
  for (const card of cards) {
    const key = descriptionKeyForTaskId(card.wordId, card.taskId);
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

  const keys = cards.map((card) => descriptionKeyForTaskId(card.wordId, card.taskId));
  const fallbacks = Object.fromEntries(
    cards.map((card) => [
      descriptionKeyForTaskId(card.wordId, card.taskId),
      inlineDescriptionFallback(card),
    ]),
  );
  const resolved = resolveDescriptions(keys, spokenLanguage, fallbacks);

  return cards.map((card) => {
    const taskType = taskTypeFromTaskId(card.taskId);
    const key = descriptionKeyForTaskId(card.wordId, card.taskId);
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
