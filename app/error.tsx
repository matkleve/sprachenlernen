"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary. Without this file every project inherits Next's
 * default error page, which is a stack trace in development and a blank screen
 * in production.
 *
 * Constitution §4: no silent failure. The user gets a state they can act on,
 * and the developer gets the error somewhere they will actually see it.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporter. Leaving this as a bare console.error is
    // fine until you have one — silently swallowing it is not.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The page could not be loaded. Trying again may be enough; if it is not,
        the error has been logged.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-muted">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
