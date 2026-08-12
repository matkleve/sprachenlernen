"use client";

import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useHeaderCollapse } from "./useHeaderCollapse";
import { shellPageTitle } from "./page-title";

const TITLE_SIZES = {
  mobile: { large: 24, small: 14 },
  desktop: { large: 30, small: 14 },
} as const;

type ShellPageTitleProps = {
  variant: "mobile" | "desktop";
  /** Always small — routes with no page scroll (review). */
  pinnedCompact?: boolean;
  className?: string;
};

/**
 * Centered page title for the shell header. Contract:
 * docs/specs/feature/app-shell.md
 *
 * One position always: horizontally centered in the header row. Font size
 * scales with scroll — large at the top, small after scrolling down.
 */
export function ShellPageTitle({ variant, pinnedCompact = false, className }: ShellPageTitleProps) {
  const pathname = usePathname();
  const title = shellPageTitle(pathname);
  const scrollCollapse = useHeaderCollapse();
  const collapse = pinnedCompact ? 1 : scrollCollapse;
  const { large, small } = TITLE_SIZES[variant];
  const fontSize = large + (small - large) * collapse;

  if (!title) return null;

  return (
    <h1
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center font-semibold tracking-tight text-ink",
        className,
      )}
      style={{
        fontSize: `${fontSize}px`,
        maxWidth: collapse < 0.5 ? "min(70vw, 20rem)" : "min(52vw, 14rem)",
      }}
      title={title}
    >
      {title}
    </h1>
  );
}

/** Routes that never scroll on mobile — title stays compact. */
export function shellHeaderStartsCompact(pathname: string): boolean {
  return pathname === routes.wordsReview;
}
