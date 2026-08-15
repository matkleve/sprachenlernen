"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Disclosure, DisclosureSummary } from "@/components/ui/Disclosure";
import type { ErrorCode, UserFacingError } from "@/lib/errors";
import { cn } from "@/lib/utils";

import { copy, formatErrorReport } from "./error-callout-content";

export type ErrorCalloutProps = UserFacingError & {
  className?: string;
  /** Stable code for support and agents — shown in technical details, not the headline. */
  code?: ErrorCode;
  /** Upstream detail for support and agents — never the only message shown. */
  developerMessage?: string;
  /** Optional retry — parent owns the action; this only renders it. */
  retry?: ReactNode;
};

/**
 * Page- and session-level failures. Contract: docs/specs/component/error-callout.md
 *
 * Field validation stays on Field (UC-002). User copy stays plain; developer
 * fields live behind Technical details and in the copy payload.
 */
export function ErrorCallout({
  userMessage,
  nextStep,
  referenceId,
  code,
  developerMessage,
  className,
  retry,
}: ErrorCalloutProps) {
  const [copied, setCopied] = useState(false);
  const hasTechnicalDetails = Boolean(code || developerMessage);

  const onCopy = async () => {
    const text = formatErrorReport({
      userMessage,
      nextStep,
      referenceId,
      code,
      developerMessage,
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail on older browsers or denied permission — the
      // reference line remains selectable as a fallback.
    }
  };

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

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs text-muted">
          {copy.referenceLabel}: {referenceId}
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={() => void onCopy()}>
          {copied ? copy.copied : copy.copyDetails}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">{copy.referenceHint}</p>

      {hasTechnicalDetails ? (
        <Disclosure className="mt-4 border-line bg-surface p-0">
          <DisclosureSummary className="px-4 py-3">{copy.technicalDetails}</DisclosureSummary>
          <div className="space-y-2 border-t border-line px-4 py-3 font-mono text-xs text-muted">
            {code ? (
              <p>
                {copy.codeLabel}: {code}
              </p>
            ) : null}
            {developerMessage ? (
              <p className="whitespace-pre-wrap break-words">{developerMessage}</p>
            ) : null}
          </div>
        </Disclosure>
      ) : null}

      {retry ? <div className="mt-4">{retry}</div> : null}
    </div>
  );
}
