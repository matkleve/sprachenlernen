import type { MethodEntry } from "@/lib/method-catalogue";
import { routes } from "@/lib/routes";

/** Where a hosted method's session lives. No duration picker — open directly. */
export function sessionHrefForMethod(method: MethodEntry): string {
  return `${routes.wordsReview}?method=${encodeURIComponent(method.id)}`;
}

export function detailHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  return `/methods/${method.id}${returnQuery}`;
}

/** Menu card destination: session for hosted, detail for off-app. */
export function cardHrefForMethod(method: MethodEntry, returnQuery = ""): string {
  return method.hosted ? sessionHrefForMethod(method) : detailHrefForMethod(method, returnQuery);
}
