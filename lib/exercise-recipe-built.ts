/** Hosted methods with a runnable exercise recipe — safe for client imports. */
const BUILT_EXERCISE_METHOD_IDS = new Set<string>(["partial-dictation"]);

export function hasExerciseRecipe(methodId: string): boolean {
  return BUILT_EXERCISE_METHOD_IDS.has(methodId);
}
