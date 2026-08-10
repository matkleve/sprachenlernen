"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorCallout } from "@/components/ui/ErrorCallout";
import type { UserFacingError } from "@/lib/errors";

import { copy } from "./route-error-surface-content";

export type RouteErrorSurfaceProps = UserFacingError & {
  onRetry: () => void;
};

/**
 * Route- and global-level recovery UI. Contract:
 * docs/specs/component/route-error-surface.md
 */
export function RouteErrorSurface({
  userMessage,
  nextStep,
  referenceId,
  onRetry,
}: RouteErrorSurfaceProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-xl px-6 pt-page-top pb-page-bottom">
      <ErrorCallout
        userMessage={userMessage}
        nextStep={nextStep}
        referenceId={referenceId}
        retry={
          <Button
            type="button"
            variant="secondary"
            pending={isPending}
            onClick={() => startTransition(() => onRetry())}
          >
            {copy.tryAgain}
          </Button>
        }
      />
    </div>
  );
}
