"use client";

import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { shellPageTitle } from "./page-title";

type ShellPageTitleProps = {
  /** Compact title in the toolbar row (scrolled, or routes with no page scroll). */
  compact: boolean;
  variant: "mobile" | "desktop";
  className?: string;
};

/**
 * Centered page title for the shell header. Contract:
 * docs/specs/feature/app-shell.md
 *
 * Large at the top of the page; shrinks into the toolbar row on scroll. The
 * header is fixed/sticky — the title never scrolls away with page content.
 */
export function ShellPageTitle({ compact, variant, className }: ShellPageTitleProps) {
  const pathname = usePathname();
  const title = shellPageTitle(pathname);

  if (!title) return null;

  if (compact) {
    return (
      <h1
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 max-w-[min(52vw,14rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center font-semibold tracking-tight text-ink",
          variant === "desktop" ? "text-sm" : "text-sm",
          className,
        )}
        title={title}
      >
        {title}
      </h1>
    );
  }

  return (
    <h1
      className={cn(
        "px-4 pb-3 text-center font-semibold tracking-tight text-ink motion-reduce:transition-none",
        variant === "desktop" ? "text-3xl" : "text-2xl",
        className,
      )}
      title={title}
    >
      {title}
    </h1>
  );
}

/** Routes that never scroll on mobile — start with a compact header title. */
export function shellHeaderStartsCompact(pathname: string): boolean {
  return pathname === routes.wordsReview;
}
