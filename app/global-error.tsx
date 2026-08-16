"use client";

import { useEffect, useMemo } from "react";

import { NextIntlClientProvider } from "next-intl";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import {
  boundaryErrorFromUnknown,
  logBoundaryError,
} from "@/lib/error-boundary";
import { useRouteEscape } from "@/features/app-shell/use-route-escape";
import en from "@/messages/en.json";

import "@/app/globals.css";

function GlobalErrorBody({
  handled,
  reset,
}: {
  handled: ReturnType<typeof boundaryErrorFromUnknown>;
  reset: () => void;
}) {
  const escape = useRouteEscape("/");
  return <RouteErrorSurface {...handled} onRetry={reset} escape={escape} />;
}

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
        <NextIntlClientProvider locale="en" messages={en}>
          <GlobalErrorBody handled={handled} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
