/**
 * Form-session ordering rules. Contract: docs/specs/service/form-practice.md
 * (session composition §).
 */

import type { LemmaTable } from "@/lib/lemma-table";
import type { StarterCard } from "@/lib/starter-deck";

export type LemmaMeta = LemmaTable["lemmas"];

export type MixFormSessionOptions = {
  lemmaMeta?: LemmaMeta;
};

/** Tense × conjugation class — used for the 2-in-4 mixing cap. */
export function paradigmMixingKey(
  lemma: string,
  cell: string,
  lemmaMeta: LemmaMeta,
): string | null {
  if (!cell) return null;

  const conjugation = lemmaMeta[lemma]?.verb;
  if (conjugation) {
    const segments = cell.split(".");
    const person = segments[segments.length - 1] ?? "";
    if (/^[123](?:sg|pl)$/.test(person)) {
      return `${conjugation}|${segments.slice(0, -1).join(".")}`;
    }
  }

  const segments = cell.split(".");
  if (segments.length >= 2) {
    return `nom|${segments.slice(0, -1).join(".") || cell}`;
  }

  return `nom|${cell}`;
}

function violatesLemmaRun(left: StarterCard, right: StarterCard): boolean {
  return left.lemma === right.lemma;
}

function classCountInWindow(
  cards: readonly StarterCard[],
  start: number,
  key: string,
  lemmaMeta: LemmaMeta,
): number {
  let count = 0;
  for (const card of cards.slice(start, start + 4)) {
    if (paradigmMixingKey(card.lemma, card.paradigmCell ?? "", lemmaMeta) === key) {
      count += 1;
    }
  }
  return count;
}

function canPlace(card: StarterCard, result: readonly StarterCard[], lemmaMeta: LemmaMeta): boolean {
  const last = result[result.length - 1];
  if (last && violatesLemmaRun(last, card)) return false;

  if (result.length < 3) return true;

  const key = paradigmMixingKey(card.lemma, card.paradigmCell ?? "", lemmaMeta);
  if (!key) return true;

  const start = Math.max(0, result.length - 3);
  return classCountInWindow([...result, card], start, key, lemmaMeta) <= 2;
}

/**
 * Reorders a fixed session queue to satisfy lemma spacing and tense×class caps.
 * Does not change membership — rule 4 (pull non-due forward) stays in sampling.
 */
export function mixFormSession(
  cards: readonly StarterCard[],
  options?: MixFormSessionOptions,
): StarterCard[] {
  if (cards.length <= 1) return [...cards];

  const lemmaMeta = options?.lemmaMeta ?? {};
  const remaining = [...cards];
  const result: StarterCard[] = [];

  while (remaining.length > 0) {
    const viable = remaining
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => canPlace(card, result, lemmaMeta));

    const pickFrom = viable.length > 0 ? viable : remaining.map((card, index) => ({ card, index }));
    pickFrom.sort(
      (left, right) => left.card.frequencyRank - right.card.frequencyRank || left.index - right.index,
    );

    const chosen = pickFrom[0]!;
    result.push(chosen.card);
    remaining.splice(chosen.index, 1);
  }

  return result;
}
