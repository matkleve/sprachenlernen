/**
 * UUID recognition, shared by the review log adapter (validating an incoming
 * `installation_id`) and `lib/installation-id.ts` (rejecting a corrupt stored
 * value). It lived in both, identically, which is one regex and two chances
 * for them to stop agreeing about what the column accepts.
 */

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** RFC 4122 versions 1–5, any case. `crypto.randomUUID()` produces a v4. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
