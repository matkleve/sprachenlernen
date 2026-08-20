/**
 * The auth failures a sign-in or sign-up page may name in its URL.
 * Contract: docs/specs/service/auth.md § Behavior 3.
 *
 * `/login?error=<message>` used to carry the copy itself, and the page
 * rendered it. React escapes, so it was never XSS — it was worse in a quieter
 * way: any sentence an attacker chose, shown on the real sign-in form, under
 * the real domain, beside the real password field. "Your session expired, call
 * this number" is a complete phishing page with no page to host.
 *
 * A code fixes that by construction: the page can only ever render copy the
 * app wrote. It also fixes a second thing by accident — the copy now comes
 * from `messages/*.json`, so a German learner stops being shown an English
 * error, which is what `lib/errors.ts` produced for every locale.
 *
 * `HandledError.userMessage` is unchanged and still goes to the log and to
 * telemetry. This union is the *display* surface, deliberately smaller.
 */

import type { HandledError } from "@/lib/errors";

export const AUTH_ERROR_CODES = [
  "invalid-credentials",
  "confirmation-missing",
  "confirmation-failed",
  "unexpected",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

const BY_ERROR_CODE: Partial<Record<HandledError["code"], AuthErrorCode>> = {
  "auth/invalid-credentials": "invalid-credentials",
  "auth/confirmation-missing": "confirmation-missing",
  "auth/confirmation-failed": "confirmation-failed",
};

/**
 * The display code for a handled error. Anything not in the map is
 * `"unexpected"` — including `internal/unexpected`, which is what an
 * unrecognised message from Supabase becomes. Falling back rather than
 * widening the union is the point: a new upstream message must not be able to
 * introduce a new user-visible string on its own.
 */
export function authErrorCodeFor(error: HandledError): AuthErrorCode {
  return BY_ERROR_CODE[error.code] ?? "unexpected";
}

/** The code a page may render, or null — never the caller's raw value. */
export function parseAuthErrorCode(
  value: string | null | undefined,
): AuthErrorCode | null {
  if (!value) return null;
  return (AUTH_ERROR_CODES as readonly string[]).includes(value)
    ? (value as AuthErrorCode)
    : null;
}
