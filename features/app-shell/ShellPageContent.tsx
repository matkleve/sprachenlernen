import type { ReactNode } from "react";

import type { ShellPageLayoutMode } from "@/lib/shell-page-layout";
import { cn } from "@/lib/utils";

import {
  shellPageContentVariants,
  type ShellPageContentWidth,
} from "./shell-page-content";

type ShellPageContentProps = {
  mode?: ShellPageLayoutMode;
  width?: ShellPageContentWidth;
  className?: string;
  children: ReactNode;
};

/**
 * Feature-level page wrapper — max width, horizontal padding, and layout mode.
 * Contract: docs/specs/feature/page-layout.md
 *
 * Shell (`AppShell`) owns float reserves on `<main>`; this owns page rhythm
 * (`md:pt-page-top` / `pb-page-bottom` on mobile the float reserve is enough)
 * and runner height (`h-review-session`).
 */
export function ShellPageContent({
  mode = "scrollable-destination",
  width,
  className,
  children,
}: ShellPageContentProps) {
  return (
    <div className={cn(shellPageContentVariants({ mode, width }), className)}>{children}</div>
  );
}
