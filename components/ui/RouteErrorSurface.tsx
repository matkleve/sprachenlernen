"use client";

import { useTransition } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { shouldHardReloadOnRetry, type RouteEscape } from "@/lib/error-boundary";
import type { HandledError } from "@/lib/errors";

import { copy } from "./route-error-surface-content";

export type RouteErrorSurfaceProps = HandledError & {
  onRetry: () => void;
  escape?: RouteEscape | null;
};

/**
 * Route- and global-level recovery UI. Contract:
 * docs/specs/component/route-error-surface.md
 */
export function RouteErrorSurface({
  userMessage,
  nextStep,
  referenceId,
  code,
  developerMessage,
  onRetry,
  escape,
}: RouteErrorSurfaceProps) {
  const [isPending, startTransition] = useTransition();

  const retry = () => {
    if (shouldHardReloadOnRetry(code)) {
      window.location.reload();
      return;
    }
    onRetry();
  };

  return (
    <div className="mx-auto max-w-xl px-6 pt-page-top pb-page-bottom">
      <ErrorCallout
        userMessage={userMessage}
        nextStep={nextStep}
        referenceId={referenceId}
        code={code}
        developerMessage={developerMessage}
        retry={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              pending={isPending}
              onClick={() => startTransition(() => retry())}
            >
              {copy.tryAgain}
            </Button>
            {escape ? (
              <ActionLink href={escape.href} variant="secondary">
                {escape.label}
              </ActionLink>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
