/**
 * External error reporting adapter. Contract:
 * docs/specs/service/errors-telemetry.md
 *
 * `logHandledError` fans out here after console logging. Reporters must never
 * throw — a broken reporter must not break the learner's session.
 */

import type { HandledError } from "@/lib/errors";

export type ErrorReporterContext = {
  requestId?: string | null;
};

export type ErrorReporter = (
  error: HandledError,
  context: ErrorReporterContext,
) => void;

const reporters: ErrorReporter[] = [];

/** Register an external reporter (e.g. Sentry). Returns an unsubscribe function. */
export function registerErrorReporter(reporter: ErrorReporter): () => void {
  reporters.push(reporter);
  return () => {
    const index = reporters.indexOf(reporter);
    if (index >= 0) reporters.splice(index, 1);
  };
}

export function reportHandledError(
  error: HandledError,
  context: ErrorReporterContext = {},
): void {
  for (const reporter of reporters) {
    try {
      reporter(error, context);
    } catch {
      // A reporter must never take down the request.
    }
  }
}

/** Tests reset reporters between cases. */
export function clearErrorReportersForTests(): void {
  reporters.length = 0;
}
