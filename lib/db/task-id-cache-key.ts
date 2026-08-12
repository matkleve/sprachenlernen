/**
 * Stable cache key for a task-id list. `React.cache` compares arguments by
 * reference; every caller builds a fresh array from `.map()`, so the key has to
 * be a string derived from the set, not the array object.
 */
export function taskIdsCacheKey(taskIds: readonly string[]): string {
  return [...new Set(taskIds)].sort().join("\0");
}
