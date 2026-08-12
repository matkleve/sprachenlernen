"use client";

import type { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type MouseEvent } from "react";

/** Minimum time pending stays visible so fast client navigations feel acknowledged. */
export const MIN_PENDING_DISPLAY_MS = 180;

function hrefToPath(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  return `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/**
 * Client navigation with a pending flag for link-style controls.
 * Modifier clicks still use the native Link behaviour (new tab, etc.).
 *
 * Pending is held for at least MIN_PENDING_DISPLAY_MS so sub-50ms route
 * changes still show feedback (profile chip, shell nav).
 */
export function usePendingNavigation(
  href: LinkProps["href"],
  { minDisplayMs = MIN_PENDING_DISPLAY_MS } = {},
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [visiblePending, setVisiblePending] = useState(false);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (isPending) {
      startedAtRef.current = Date.now();
      setVisiblePending(true);
      return;
    }

    if (!visiblePending) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minDisplayMs - elapsed);
    const timer = window.setTimeout(() => setVisiblePending(false), remaining);
    return () => window.clearTimeout(timer);
  }, [isPending, minDisplayMs, visiblePending]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || isModifiedClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(hrefToPath(href));
    });
  };

  return { isPending: visiblePending, onClick };
}
