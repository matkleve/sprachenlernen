/** Hosted methods with a runnable exercise recipe — safe for client imports. */
const BUILT_EXERCISE_METHOD_IDS = new Set<string>([
  "partial-dictation",
  "full-dictation",
  "extensive-reading",
  "reading-aloud",
  "build-a-sentence",
  "free-production",
]);

export function hasExerciseRecipe(methodId: string): boolean {
  return BUILT_EXERCISE_METHOD_IDS.has(methodId);
}
