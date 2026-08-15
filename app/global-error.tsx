"use client";

import { useEffect, useMemo } from "react";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import {
  boundaryErrorFromUnknown,
  logBoundaryError,
} from "@/lib/error-boundary";

import "@/app/globals.css";

/**
 * Root layout error boundary — no app shell. Contract:
 * docs/specs/service/errors-boundaries.md
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handled = useMemo(
    () =>
      boundaryErrorFromUnknown(error, {
        route: "/",
        digest: error.digest,
      }),
    [error],
  );

  useEffect(() => {
    logBoundaryError(handled, "/");
  }, [handled]);

  return (
    <html lang="en">
      <body className="bg-canvas text-ink antialiased">
        <RouteErrorSurface {...handled} onRetry={reset} />
      </body>
    </html>
  );
}
