/** Hosted + guided methods with a runnable exercise recipe — safe for client imports. */
import { GUIDED_METHOD_IDS } from "@/lib/exercise-recipe/guided-ids";

const BUILT_HOSTED_EXERCISE_METHOD_IDS = [
  "partial-dictation",
  "full-dictation",
  "extensive-reading",
  "reading-aloud",
  "listening-level-1",
  "build-a-sentence",
  "cloze-sentences",
  "minimal-pairs",
  "free-production",
  "dictogloss",
  "four-three-two",
  "diary-three-sentences",
  "narrow-reading",
  "intensive-reading",
  "retell-what-you-read",
  "recite-memorised",
  "summarise-what-you-read",
  "rule-at-point-of-error",
] as const;

const BUILT_EXERCISE_METHOD_IDS = new Set<string>([
  ...BUILT_HOSTED_EXERCISE_METHOD_IDS,
  ...GUIDED_METHOD_IDS,
]);

export function hasExerciseRecipe(methodId: string): boolean {
  return BUILT_EXERCISE_METHOD_IDS.has(methodId);
}

export const builtExerciseMethodIds = (): readonly string[] =>
  Array.from(BUILT_EXERCISE_METHOD_IDS).sort();
