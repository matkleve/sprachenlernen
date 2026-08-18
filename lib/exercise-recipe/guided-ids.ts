/** Guided catalogue method ids — shared by built registry and server composer. */
export const GUIDED_METHOD_IDS = [
  "book-you-know",
  "background-listening",
  "self-talk",
  "voice-message",
  "role-play",
  "singing-along",
  "interpreting",
  "translate-a-song",
  "write-and-perform-a-play",
  "mine-your-own-sentences",
  "handwriting-shakiest",
  "cook-from-a-recipe",
  "video-game-in-target-language",
  "tandem-or-language-cafe",
  "order-ask-complain",
  "film-you-know-by-heart",
] as const;

export type GuidedMethodId = (typeof GUIDED_METHOD_IDS)[number];

const GUIDED_SET = new Set<string>(GUIDED_METHOD_IDS);

export function isGuidedMethodId(methodId: string): boolean {
  return GUIDED_SET.has(methodId);
}
