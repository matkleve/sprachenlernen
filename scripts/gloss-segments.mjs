/**
 * Gloss segment helpers for description snapshot scripts.
 * Keep in sync with lib/dedupe-gloss-segments.ts.
 */

/** @param {string} gloss */
export function dedupeGlossSegments(gloss) {
  const trimmed = gloss.trim();
  if (!trimmed.includes(",")) return trimmed;

  const segments = trimmed
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const seen = new Set();
  const unique = [];

  for (const segment of segments) {
    const key = segment.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(segment);
  }

  return unique.join(", ");
}

/** @param {string} gloss */
export function hasDuplicateGlossSegments(gloss) {
  const trimmed = gloss.trim();
  if (!trimmed.includes(",")) return false;

  const segments = trimmed
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const seen = new Set();
  for (const segment of segments) {
    const key = segment.toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
