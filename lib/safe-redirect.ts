/**
 * Internal-path validation for redirects that take their destination from the
 * request. Contract: docs/specs/service/auth.md § Behavior 8.
 *
 * `value.startsWith("/")` is the check this replaces, and it is the reason
 * `/auth/callback?next=//evil.com` sent visitors to `evil.com`: a
 * protocol-relative URL starts with `/`, and `new URL("//evil.com", origin)`
 * resolves to a foreign origin, not to a path on `origin`. WHATWG URL parsing
 * also normalises `\` to `/`, so `/\evil.com` reaches the same place — which
 * is why matching on the first character cannot be made correct by adding a
 * second character to the test.
 *
 * Rejected alternative: an allowlist of `routes` values. `next` legitimately
 * carries deep links with ids and query strings (`/content/<uuid>`), so an
 * allowlist would have to be a prefix match — and a prefix match against
 * "/content" accepts "/content.evil.com" unless it re-does exactly the parsing
 * below. Parse once, against a known-hostile base, and compare origins.
 */

/** A base that is never this app's origin, so a value that escapes is visible. */
const PROBE_ORIGIN = "https://probe.invalid";

/**
 * Returns `candidate` when it is a path on this deployment, else `fallback`.
 *
 * `fallback` is trusted — it comes from `lib/routes.ts`, never from a request.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback: string,
): string {
  if (!candidate || !candidate.startsWith("/")) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(candidate, PROBE_ORIGIN);
  } catch {
    return fallback;
  }

  // Escaped the probe origin → it was never a path in the first place.
  if (parsed.origin !== PROBE_ORIGIN) return fallback;

  // Re-serialising is what makes the return value safe to hand to `new URL()`
  // a second time: the caller resolves against the real origin, and this is
  // the exact string the parser already agreed is a path.
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
