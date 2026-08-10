"use client";

import type { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type MouseEvent } from "react";

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
 */
export function usePendingNavigation(href: LinkProps["href"]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || isModifiedClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(hrefToPath(href));
    });
  };

  return { isPending, onClick };
}
