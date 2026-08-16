"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { shellPageTitle } from "./page-title";
import { useHeaderCollapse } from "./useHeaderCollapse";
import {
  MOBILE_TITLE_LARGE_PX,
  MOBILE_TITLE_SMALL_PX,
  MOBILE_TITLE_LARGE_MAX_REM,
  desktopShellTitleMaxWidth,
  mobileShellTitleClampedMaxWidth,
  mobileShellTitleMaxWidth,
  mobileTitleWrapsTwoLines,
  shellTitleFontSize,
} from "./shell-page-title-layout";

const TITLE_SIZES = {
  mobile: { large: MOBILE_TITLE_LARGE_PX, small: MOBILE_TITLE_SMALL_PX },
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
 * Mobile: in-flow between corner chips, up to two lines. Desktop: absolutely
 * centered, single line with ellipsis.
 */
export function ShellPageTitle({ variant, pinnedCompact = false, className }: ShellPageTitleProps) {
  const pathname = usePathname();
  const title = shellPageTitle(pathname);
  const scrollCollapse = useHeaderCollapse();
  const collapse = pinnedCompact ? 1 : scrollCollapse;
  const { large, small } = TITLE_SIZES[variant];
  const fontSize = shellTitleFontSize(large, small, collapse);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [wrapsTwoLines, setWrapsTwoLines] = useState(false);

  useLayoutEffect(() => {
    if (variant !== "mobile" || !title) {
      document.documentElement.style.removeProperty("--shell-float-top-active");
      setWrapsTwoLines(false);
      return;
    }

    const el = measureRef.current;
    if (!el) return;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const wraps = mobileTitleWrapsTwoLines(el.scrollHeight, lineHeight);
    setWrapsTwoLines(wraps);
    document.documentElement.style.setProperty(
      "--shell-float-top-active",
      wraps
        ? "var(--spacing-shell-float-top-expanded)"
        : "var(--spacing-shell-float-top)",
    );
  }, [title, variant]);

  useLayoutEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--shell-float-top-active");
    };
  }, []);

  if (!title) return null;

  const isMethodDetail =
    pathname.startsWith(`${routes.methods}/`) && pathname.length > routes.methods.length + 1;
  const TitleTag = isMethodDetail ? "p" : "h1";

  if (variant === "mobile") {
    const maxWidth = mobileShellTitleClampedMaxWidth(
      mobileShellTitleMaxWidth(wrapsTwoLines, fontSize, collapse),
    );

    return (
      <TitleTag
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 z-0 w-max -translate-x-1/2 -translate-y-1/2 text-center font-semibold leading-tight tracking-tight text-ink line-clamp-2",
          className,
        )}
        style={{
          fontSize: `${fontSize}px`,
          maxWidth,
          minHeight: wrapsTwoLines ? "2lh" : undefined,
        }}
        title={title}
      >
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-center font-semibold leading-tight tracking-tight opacity-0"
          style={{
            fontSize: `${large}px`,
            width: `${MOBILE_TITLE_LARGE_MAX_REM}rem`,
          }}
        >
          {title}
        </span>
        {title}
      </TitleTag>
    );
  }

  return (
    <TitleTag
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center font-semibold tracking-tight text-ink",
        className,
      )}
      style={{
        fontSize: `${fontSize}px`,
        maxWidth: desktopShellTitleMaxWidth(collapse),
      }}
      title={title}
    >
      {title}
    </TitleTag>
  );
}

/** Routes that never scroll on mobile — title stays compact. */
export function shellHeaderStartsCompact(pathname: string): boolean {
  return pathname === routes.wordsReview;
}
