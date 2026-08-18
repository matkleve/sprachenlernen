/**
 * Resolve description text for a pool card in the spoken language.
 * Contract: docs/specs/service/gloss-resolver.md
 */
import {
  descriptionFaceForTaskType,
  descriptionKeyForTaskId,
  taskTypeFromTaskId,
} from "@/lib/description-keys";
import { resolveDescription } from "@/lib/gloss-resolver";
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
  const map: Record<string, string> = {};
  for (const card of cards) {
    map[card.lemma] = resolveCardDescription(card, spokenLanguage);
  }
  return map;
}

export function localizeSessionCard(card: SessionCard, spokenLanguage: string): SessionCard {
  const taskType = taskTypeFromTaskId(card.taskId);
  if (taskType === "meaning-recall") {
    return { ...card, back: resolveCardDescription(card, spokenLanguage) };
  }
  if (taskType === "form-recall") {
    return { ...card, front: resolveCardDescription(card, spokenLanguage) };
  }
  return card;
}
