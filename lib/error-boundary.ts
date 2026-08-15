/**
 * Route error boundaries. Contract: docs/specs/service/errors-boundaries.md
 */

import {
  createReferenceId,
  internalUnexpected,
  logHandledError,
  type HandledError,
} from "@/lib/errors";

/** Throw from server or client when you already have a full HandledError. */
export class AppError extends Error {
  readonly handled: HandledError;

  constructor(handled: HandledError) {
    super(handled.developerMessage);
    this.name = "AppError";
    this.handled = handled;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

const ROUTE_OPERATIONS: readonly { prefix: string; operation: string }[] = [
  { prefix: "/words/review", operation: "start your review session" },
  { prefix: "/words", operation: "load your vocabulary" },
  { prefix: "/methods/", operation: "load this method" },
  { prefix: "/methods", operation: "load the method menu" },
  { prefix: "/progress", operation: "load your progress" },
  { prefix: "/profile", operation: "load your profile" },
];

/** Maps a pathname to the operation phrase used in user copy. */
export function routeOperation(pathname: string): string {
  for (const { prefix, operation } of ROUTE_OPERATIONS) {
    if (pathname === prefix) return operation;
    if (prefix.endsWith("/") && pathname.startsWith(prefix)) return operation;
    if (pathname.startsWith(`${prefix}/`)) return operation;
  }
  return "load this page";
}

function isNetworkFailure(message: string): boolean {
  return /failed to fetch|networkerror|network error|load failed|offline/i.test(message);
}

function isMissingEnv(message: string): boolean {
  return /must be set|NEXT_PUBLIC_SUPABASE|environment/i.test(message);
}

type BoundaryContext = {
  route: string;
  digest?: string;
};

/**
 * Maps an uncaught boundary error to HandledError. Never returns banned generics.
 */
export function boundaryErrorFromUnknown(error: unknown, context: BoundaryContext): HandledError {
  if (isAppError(error)) {
    return error.handled;
  }

  const operation = routeOperation(context.route);
  const developerMessage = formatDeveloperMessage(error, context.digest);

  if (error instanceof Error && isMissingEnv(error.message)) {
    return {
      code: "config/missing-env",
      userMessage: "This environment is not fully configured.",
      nextStep: "Try again later. If you run this site yourself, check the deployment environment variables.",
      referenceId: createReferenceId(),
      developerMessage,
      context: { feature: "app-shell", operation, route: context.route },
    };
  }

  if (error instanceof Error && isNetworkFailure(error.message)) {
    return {
      code: "network/offline",
      userMessage: "You appear to be offline.",
      nextStep: "Check your connection and try again.",
      referenceId: createReferenceId(),
      developerMessage,
      context: { feature: "app-shell", operation, route: context.route },
    };
  }

  const handled = internalUnexpected(error, {
    feature: "app-shell",
    operation,
    route: context.route,
  });

  return {
    ...handled,
    code: "render/boundary",
    developerMessage,
  };
}

function formatDeveloperMessage(error: unknown, digest?: string): string {
  const base =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  if (!digest) return base;
  return `${base}\nNext.js digest: ${digest}`;
}

/** Logs a boundary failure with route context — single hook for future reporters. */
export function logBoundaryError(error: HandledError, route: string): void {
  logHandledError({
    ...error,
    context: { ...error.context, route },
  });
}
