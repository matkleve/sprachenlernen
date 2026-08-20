import { describe, expect, it } from "vitest";

import {
  AUTH_ERROR_CODES,
  authErrorCodeFor,
  parseAuthErrorCode,
} from "@/lib/auth-error-code";
import { authConfirmationMissing, fromAuthError } from "@/lib/errors";

/**
 * Contract: docs/specs/service/auth.md § Behavior 3.
 *
 * `/login?error=<free text>` rendered whatever it was given. React escapes, so
 * this was never XSS — it was a sentence of an attacker's choosing displayed
 * on the real sign-in form, under the real domain, next to the real password
 * field. A code cannot say anything the app did not write.
 */
describe("parseAuthErrorCode", () => {
  it.each(AUTH_ERROR_CODES)("accepts the known code %s", (code) => {
    expect(parseAuthErrorCode(code)).toBe(code);
  });

  it.each([
    "Your session expired — call +49 30 000000 to restore it",
    "invalid-credentials; and also call us",
    "<script>alert(1)</script>",
    "internal/unexpected",
    "",
    "   ",
  ])("refuses arbitrary text: %s", (value) => {
    expect(parseAuthErrorCode(value)).toBeNull();
  });

  it("refuses a missing value", () => {
    expect(parseAuthErrorCode(undefined)).toBeNull();
    expect(parseAuthErrorCode(null)).toBeNull();
  });
});

describe("authErrorCodeFor", () => {
  it("maps a wrong password to its own code, so the form can say something useful", () => {
    const handled = fromAuthError("Invalid login credentials", { operation: "sign you in" });
    expect(authErrorCodeFor(handled)).toBe("invalid-credentials");
  });

  it("maps an unrecognised upstream message to the generic code", () => {
    const handled = fromAuthError("Password too short", { operation: "create your account" });
    expect(authErrorCodeFor(handled)).toBe("unexpected");
  });

  it("maps a truncated confirmation link to its own code", () => {
    expect(authErrorCodeFor(authConfirmationMissing())).toBe("confirmation-missing");
  });

  it("never returns a value parseAuthErrorCode would refuse", () => {
    const handled = fromAuthError("anything at all", { operation: "sign you in" });
    expect(parseAuthErrorCode(authErrorCodeFor(handled))).toBe(authErrorCodeFor(handled));
  });
});
