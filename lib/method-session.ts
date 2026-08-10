import type { MethodEntry } from "@/lib/method-catalogue";
import { routes } from "@/lib/routes";

/**
 * Methods that run on the card engine under `/words/review`. UC-063 names Words
 * for the material, not for every hosted method — only card sessions belong here
 * until other hosted runners ship on their own routes.
 */
const WORDS_REVIEW_METHOD_IDS = new Set(["srs-session"]);

export function usesWordsReview(method: MethodEntry): boolean {
  return WORDS_REVIEW_METHOD_IDS.has(method.id);
}

/** Where a card-engine session lives. No duration picker — open directly. */
export function sessionHrefForMethod(method: MethodEntry): string {
  return `${routes.wordsReview}?method=${encodeURIComponent(method.id)}`;
}

export function detailHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  return `/methods/${method.id}${returnQuery}`;
}

/** Menu card destination: Words review for the card engine, detail otherwise. */
export function cardHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  if (usesWordsReview(method)) {
    return sessionHrefForMethod(method);
  }
  return detailHrefForMethod(method, returnQuery);
}
