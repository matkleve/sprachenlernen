import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AppError,
  boundaryErrorFromUnknown,
  logBoundaryError,
  routeOperation,
} from "@/lib/error-boundary";
import { internalUnexpected, setReferenceIdFactory } from "@/lib/errors";

describe("error-boundary", () => {
  afterEach(() => {
    setReferenceIdFactory(() => crypto.randomUUID().replace(/-/g, "").slice(0, 8));
  });

  it("maps pathname to an operation phrase", () => {
    expect(routeOperation("/words/review")).toBe("start your review session");
    expect(routeOperation("/words")).toBe("load your vocabulary");
    expect(routeOperation("/methods/srs-session")).toBe("load this method");
    expect(routeOperation("/unknown")).toBe("load this page");
  });

  it("uses embedded HandledError from AppError", () => {
    const handled = internalUnexpected(new Error("boom"), {
      operation: "sign you in",
    });
    const error = boundaryErrorFromUnknown(new AppError(handled), {
      route: "/words/review",
    });
    expect(error).toBe(handled);
  });

  it("names the review operation for uncaught errors on /words/review", () => {
    setReferenceIdFactory(() => "deadbeef");
    const error = boundaryErrorFromUnknown(new Error("Cannot read properties of undefined"), {
      route: "/words/review",
      digest: "89458791",
    });

    expect(error.code).toBe("render/boundary");
    expect(error.userMessage).toBe("Could not start your review session.");
    expect(error.referenceId).toBe("deadbeef");
    expect(error.developerMessage).toContain("89458791");
    expect(error.userMessage).not.toMatch(/something went wrong/i);
  });

  it("classifies network failures", () => {
    const error = boundaryErrorFromUnknown(new Error("Failed to fetch"), {
      route: "/words",
    });
    expect(error.code).toBe("network/offline");
    expect(error.userMessage).toBe("You appear to be offline.");
  });

  it("logs route with the handled error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handled = boundaryErrorFromUnknown(new Error("x"), { route: "/progress" });
    logBoundaryError(handled, "/progress");
    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(payload.context.route).toBe("/progress");
    spy.mockRestore();
  });
});
