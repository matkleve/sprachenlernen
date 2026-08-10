import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearErrorReportersForTests,
  registerErrorReporter,
  reportHandledError,
} from "@/lib/error-telemetry";
import { authConfirmationMissing, logHandledError } from "@/lib/errors";

describe("error-telemetry", () => {
  afterEach(() => {
    clearErrorReportersForTests();
  });

  it("calls registered reporters with the handled error and context", () => {
    const reporter = vi.fn();
    registerErrorReporter(reporter);

    const error = authConfirmationMissing();
    reportHandledError(error, { requestId: "req-1" });

    expect(reporter).toHaveBeenCalledWith(error, { requestId: "req-1" });
  });

  it("unsubscribes a reporter", () => {
    const reporter = vi.fn();
    const unsubscribe = registerErrorReporter(reporter);
    unsubscribe();

    reportHandledError(authConfirmationMissing());
    expect(reporter).not.toHaveBeenCalled();
  });

  it("does not throw when a reporter fails", () => {
    registerErrorReporter(() => {
      throw new Error("reporter down");
    });

    expect(() => reportHandledError(authConfirmationMissing())).not.toThrow();
  });

  it("fans out from logHandledError after console output", () => {
    const reporter = vi.fn();
    registerErrorReporter(reporter);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const error = authConfirmationMissing();
    logHandledError(error, "req-abc");

    expect(spy).toHaveBeenCalledOnce();
    expect(reporter).toHaveBeenCalledWith(error, { requestId: "req-abc" });
    spy.mockRestore();
  });
});
