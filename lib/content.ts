/**
 * Copy for routes that are not a feature.
 *
 * The home route is a **holding page**, not the landing page
 * ([ADR-0010](../docs/adr/0010-the-route-model.md)). Its sentence is quoted
 * verbatim from the study rather than written here, because positioning copy is
 * a product decision that belongs to T-B7 — and a sentence invented in passing
 * is exactly how a product acquires positioning nobody chose.
 */

export const home = {
  name: "Sprachenlernen",
  /** Verbatim from docs/study/README.md, the consequence of thesis 1. */
  thesis: "Progress is shown as measured competence, never as activity.",
  languagesLink: "What the app claims for each language",
  designExplorerLink: "Compare five design directions",
} as const;
