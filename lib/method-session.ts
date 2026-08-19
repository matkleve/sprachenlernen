import type { MethodEntry } from "@/lib/method-catalogue";
import { hasExerciseRecipe } from "@/lib/exercise-recipe-built";
import { routes } from "@/lib/routes";

/**
 * Methods that run on the card engine under `/words/review`. UC-063 names Words
 * for the material, not for every hosted method — only card sessions belong here
 * until other hosted runners ship on their own routes.
 */
export const CARD_ENGINE_METHOD_ID = "srs-session";

const WORDS_REVIEW_METHOD_IDS = new Set<string>([CARD_ENGINE_METHOD_ID]);

/**
 * The href a surface uses to start the card engine without holding a catalogue
 * entry. Three surfaces wanted this and each built the query string by hand,
 * which put the method id in five places and made `method-engines.md`'s "only
 * usesWordsReview may open a runner" false the day it was written.
 */
export function cardEngineSessionHref(): string {
  return `${routes.wordsReview}?method=${encodeURIComponent(CARD_ENGINE_METHOD_ID)}`;
}

export function usesWordsReview(method: MethodEntry): boolean {
  return WORDS_REVIEW_METHOD_IDS.has(method.id);
}

export function usesExerciseRunner(method: MethodEntry): boolean {
  return method.hosted && !usesWordsReview(method) && hasExerciseRecipe(method.id);
}

export function exerciseSessionHref(
  methodId: string,
  options?: { sourceId?: string | null; budgetMinutes?: number },
): string {
  const params = new URLSearchParams({ method: methodId });
  if (options?.sourceId) params.set("sourceId", options.sourceId);
  if (options?.budgetMinutes !== undefined) {
    params.set("minutes", String(options.budgetMinutes));
  }
  return `${routes.practice}?${params.toString()}`;
}

/** Where a hosted session lives — card engine or exercise runner. */
export function sessionHrefForMethod(
  method: MethodEntry,
  options?: { sourceId?: string | null; budgetMinutes?: number },
): string {
  if (usesWordsReview(method)) {
    const params = new URLSearchParams({ method: method.id });
    if (options?.budgetMinutes !== undefined) {
      params.set("minutes", String(options.budgetMinutes));
    }
    return `${routes.wordsReview}?${params.toString()}`;
  }
  if (usesExerciseRunner(method)) {
    return exerciseSessionHref(method.id, options);
  }
  return detailHrefForMethod(method);
}

export function detailHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  return `/methods/${method.id}${returnQuery}`;
}

/** Whether the method menu card opens a session directly. */
export function isRunnableFromMenu(method: MethodEntry): boolean {
  return usesWordsReview(method) || usesExerciseRunner(method);
}

/** Visible header marker on catalogue cards — contract: method-card.md */
export type CardDestinationMarker = "start" | "info";

export function cardDestinationMarker(method: MethodEntry): CardDestinationMarker {
  return isRunnableFromMenu(method) ? "start" : "info";
}

/** Menu card destination: card engine opens session; everything else opens overview. */
export function cardHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  if (usesWordsReview(method)) {
    return sessionHrefForMethod(method);
  }
  return detailHrefForMethod(method, returnQuery);
}
