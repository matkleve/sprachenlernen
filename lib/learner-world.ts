/**
 * Lernwelt domain helpers. Contract: docs/specs/service/learner-world.md
 */

export const LEARNER_WORLD_IDS = [
  "business",
  "everyday",
  "technical",
  "politics",
  "nature",
  "general",
] as const;

export type LearnerWorldId = (typeof LEARNER_WORLD_IDS)[number];

export type LearnerWorld = {
  worldId: LearnerWorldId;
  setAt: string | null;
};

export const DEFAULT_LEARNER_WORLD_CONFIG = {
  gammaMatch: 1.5,
} as const;

export function isLearnerWorldId(value: string): value is LearnerWorldId {
  return (LEARNER_WORLD_IDS as readonly string[]).includes(value);
}

export function worldMatchFactor(
  worlds: readonly string[] | undefined,
  activeWorld: LearnerWorldId,
  gamma: number = DEFAULT_LEARNER_WORLD_CONFIG.gammaMatch,
): number {
  if (activeWorld === "general") return 1;
  if (worlds?.includes(activeWorld)) return gamma;
  return 1;
}

export function defaultLearnerWorld(): LearnerWorld {
  return { worldId: "general", setAt: null };
}
