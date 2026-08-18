/**
 * Collapse repeated comma-separated gloss segments. Machine translation of
 * "oneself, himself, herself" often yields "sich selbst, sich selbst, …".
 * Comparison is case-insensitive; the first occurrence's casing is kept.
 *
 * Contract: docs/specs/service/gloss-resolver.md (segment deduplication).
 * Keep in sync with scripts/gloss-segments.mjs.
 */
export function dedupeGlossSegments(gloss: string): string {
  const trimmed = gloss.trim();
  if (!trimmed.includes(",")) return trimmed;

  const segments = trimmed
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const segment of segments) {
    const key = segment.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(segment);
  }

  return unique.join(", ");
}
