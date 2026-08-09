import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertUserMessage,
  authConfirmationFailed,
  authConfirmationMissing,
  catalogueLoadFailed,
  fromAuthError,
  internalUnexpected,
  logHandledError,
  setReferenceIdFactory,
  toUserFacing,
} from "@/lib/errors";

describe("SPEC-service-errors", () => {
  afterEach(() => {
    setReferenceIdFactory(() => crypto.randomUUID().replace(/-/g, "").slice(0, 8));
  });

  it("rejects banned generic user messages", () => {
    expect(() => assertUserMessage("An error occurred.")).toThrow(/Banned/);
    expect(() => assertUserMessage("Something went wrong")).toThrow(/Banned/);
    expect(() => assertUserMessage("Error:")).toThrow(/Banned/);
  });

  it("maps invalid credentials to a stable code and user copy", () => {
    setReferenceIdFactory(() => "abcd1234");
    const error = fromAuthError("Invalid login credentials", { operation: "sign you in" });
    expect(error.code).toBe("auth/invalid-credentials");
    expect(error.userMessage).toBe("The email or password is not correct.");
    expect(error.developerMessage).toBe("Invalid login credentials");
    expect(error.referenceId).toBe("abcd1234");
  });

  it("names the operation for internal/unexpected user copy", () => {
    const error = internalUnexpected(new Error("boom"), { operation: "load the catalogue" });
    expect(error.code).toBe("internal/unexpected");
    expect(error.userMessage).toBe("Could not load the catalogue.");
    expect(error.developerMessage).toContain("boom");
  });

  it("strips developer fields for UI consumers", () => {
    const error = catalogueLoadFailed(["vocabulary.json: duplicate id"]);
    const facing = toUserFacing(error);
    expect(facing).toEqual({
      userMessage: error.userMessage,
      nextStep: error.nextStep,
      referenceId: error.referenceId,
    });
    expect(facing).not.toHaveProperty("developerMessage");
    expect(facing).not.toHaveProperty("code");
  });

  it("logs code, referenceId, and developerMessage together", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = authConfirmationMissing();
    logHandledError(error);
    expect(spy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(payload).toMatchObject({
      code: "auth/confirmation-missing",
      referenceId: error.referenceId,
      developerMessage: error.developerMessage,
    });
    spy.mockRestore();
  });

  it("maps confirmation failures without leaking raw upstream text to users", () => {
    const error = authConfirmationFailed("Email link is invalid or has expired");
    expect(error.code).toBe("auth/confirmation-failed");
    expect(error.userMessage).toBe("Could not confirm your email.");
    expect(error.developerMessage).toBe("Email link is invalid or has expired");
  });
});
