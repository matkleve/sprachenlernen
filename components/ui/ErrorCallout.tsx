import type { ReactNode } from "react";

import type { UserFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";

import { copy } from "./error-callout-content";

export type ErrorCalloutProps = UserFacingError & {
  className?: string;
  /** Optional retry — parent owns the action; this only renders it. */
  retry?: ReactNode;
};

/**
 * Page- and session-level failures. Contract: docs/specs/component/error-callout.md
 *
 * Field validation stays on Field (UC-002). This surface never receives
 * developerMessage or raw upstream text.
 */
export function ErrorCallout({
  userMessage,
  nextStep,
  referenceId,
  className,
  retry,
}: ErrorCalloutProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-card border border-danger bg-danger-soft px-5 py-4 text-ink shadow-soft",
        className,
      )}
    >
      <p className="text-base font-medium text-ink">{userMessage}</p>
      {nextStep ? <p className="mt-2 text-sm text-muted">{nextStep}</p> : null}
      <p className="mt-3 font-mono text-xs text-muted">
        {copy.referenceLabel}: {referenceId}
      </p>
      {retry ? <div className="mt-4">{retry}</div> : null}
    </div>
  );
}
