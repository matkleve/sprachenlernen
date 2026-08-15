"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import {
  boundaryErrorFromUnknown,
  logBoundaryError,
} from "@/lib/error-boundary";

/**
 * Destination-scoped error boundary. Contract:
 * docs/specs/service/errors-boundaries.md
 *
 * Renders inside the app shell so Methods / Words / Progress navigation survives
 * a failure in one destination's content tree.
 */
export function DestinationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const handled = useMemo(
    () => boundaryErrorFromUnknown(error, { route: pathname, digest: error.digest }),
    [error, pathname],
  );

  useEffect(() => {
    logBoundaryError(handled, pathname);
  }, [handled, pathname]);

  return <RouteErrorSurface {...handled} onRetry={reset} />;
}
