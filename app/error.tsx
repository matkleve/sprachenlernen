"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import {
  boundaryErrorFromUnknown,
  logBoundaryError,
} from "@/lib/error-boundary";

/**
 * Route-level error boundary. Contract: docs/specs/service/errors-boundaries.md
 *
 * Replaces Next's generic fallback. Maps uncaught errors to HandledError so the
 * user sees what they were trying to do — not "Something went wrong".
 */
export default function Error({
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
