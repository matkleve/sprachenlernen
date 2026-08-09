/**
 * Cross-cutting error contract. docs/specs/service/errors.md
 *
 * Every handled failure gets two audiences: copy the user can act on, and detail
 * an agent or developer can grep. Raw `throw new Error("…")` in features is a
 * bug once this module exists.
 */

export const ERROR_CODES = [
  "auth/invalid-credentials",
  "auth/confirmation-missing",
  "auth/confirmation-failed",
  "catalogue/load-failed",
  "network/offline",
  "internal/unexpected",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ErrorContext = {
  feature?: string;
  operation?: string;
  [key: string]: string | number | boolean | undefined;
};

export type HandledError = {
  code: ErrorCode;
  userMessage: string;
  nextStep?: string;
  referenceId: string;
  developerMessage: string;
  context?: ErrorContext;
};

/** What ErrorCallout and other UI may receive — never developer fields. */
export type UserFacingError = Pick<HandledError, "userMessage" | "nextStep" | "referenceId">;

const BANNED_USER_MESSAGES = [
  /^an error occurred\.?$/i,
  /^something went wrong\.?$/i,
  /^error:?$/i,
] as const;

let referenceIdFactory: () => string = () => crypto.randomUUID().replace(/-/g, "").slice(0, 8);

/** Tests pin ids; production uses crypto. */
export function setReferenceIdFactory(factory: () => string): void {
  referenceIdFactory = factory;
}

export function createReferenceId(): string {
  return referenceIdFactory();
}

export function assertUserMessage(message: string): void {
  const trimmed = message.trim();
  for (const pattern of BANNED_USER_MESSAGES) {
    if (pattern.test(trimmed)) {
      throw new Error(`Banned user-facing error message: "${message}"`);
    }
  }
}

export function toUserFacing(error: HandledError): UserFacingError {
  return {
    userMessage: error.userMessage,
    nextStep: error.nextStep,
    referenceId: error.referenceId,
  };
}

export function logHandledError(error: HandledError): void {
  console.error(
    JSON.stringify({
      code: error.code,
      referenceId: error.referenceId,
      context: error.context,
      developerMessage: error.developerMessage,
    }),
  );
}

type BuildInput = {
  code: ErrorCode;
  userMessage: string;
  developerMessage: string;
  nextStep?: string;
  context?: ErrorContext;
  referenceId?: string;
};

function build(input: BuildInput): HandledError {
  assertUserMessage(input.userMessage);
  return {
    code: input.code,
    userMessage: input.userMessage,
    nextStep: input.nextStep,
    referenceId: input.referenceId ?? createReferenceId(),
    developerMessage: input.developerMessage,
    context: input.context,
  };
}

export function internalUnexpected(
  cause: unknown,
  context: ErrorContext,
): HandledError {
  const operation = context.operation ?? "complete that action";
  const developerMessage =
    cause instanceof Error ? (cause.stack ?? cause.message) : String(cause);
  return build({
    code: "internal/unexpected",
    userMessage: `Could not ${operation}.`,
    developerMessage,
    nextStep: "Try again in a moment. If it keeps failing, note the reference below.",
    context,
  });
}

export function catalogueLoadFailed(details: string[], context?: ErrorContext): HandledError {
  return build({
    code: "catalogue/load-failed",
    userMessage: "Could not load the method catalogue.",
    developerMessage: details.join("; "),
    nextStep: "Refresh the page. If this keeps happening, note the reference below.",
    context: { feature: "method-menu", operation: "load the method catalogue", ...context },
  });
}

const AUTH_MESSAGE_MAP: Record<string, { code: ErrorCode; userMessage: string; nextStep?: string }> =
  {
    "Invalid login credentials": {
      code: "auth/invalid-credentials",
      userMessage: "The email or password is not correct.",
      nextStep: "Check what you typed, or create an account if you do not have one yet.",
    },
  };

export function fromAuthError(
  upstreamMessage: string,
  context: ErrorContext,
): HandledError {
  const mapped = AUTH_MESSAGE_MAP[upstreamMessage];
  if (mapped) {
    return build({
      ...mapped,
      developerMessage: upstreamMessage,
      context: { feature: "auth", ...context },
    });
  }
  return build({
    code: "internal/unexpected",
    userMessage: `Could not ${context.operation ?? "sign you in"}.`,
    developerMessage: upstreamMessage,
    nextStep: "Try again. If it keeps failing, note the reference below.",
    context: { feature: "auth", ...context },
  });
}

export function authConfirmationMissing(): HandledError {
  return build({
    code: "auth/confirmation-missing",
    userMessage: "The confirmation link is incomplete.",
    developerMessage: "GET /auth/callback without code query parameter",
    nextStep: "Open the full link from your email, or sign in if you already confirmed.",
    context: { feature: "auth", operation: "confirm your email" },
  });
}

export function authConfirmationFailed(upstreamMessage: string): HandledError {
  return build({
    code: "auth/confirmation-failed",
    userMessage: "Could not confirm your email.",
    developerMessage: upstreamMessage,
    nextStep: "Request a new confirmation email by signing up again, or sign in if you already confirmed.",
    context: { feature: "auth", operation: "confirm your email" },
  });
}
