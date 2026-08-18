"use client";

import type { ReactNode } from "react";

import { HeaderScrim } from "./HeaderScrim";
import { cn } from "@/lib/utils";

const safeTop = "pt-[max(1rem,env(safe-area-inset-top))]";

/** Horizontal reserve so an absolutely centred title cannot overlap corner icon rows. */
const desktopCenterReserve = "px-48";

export type ShellHeaderBarProps = {
  variant: "mobile" | "desktop";
  /** 0 at scroll top, 1 when collapsed — drives header scrim visibility. */
  collapse: number;
  left: ReactNode;
  center?: ReactNode;
  right: ReactNode;
  className?: string;
};

/**
 * Shared top chrome for marketing and signed-in shell: sticky/fixed bar with
 * scroll scrim. Contract: docs/specs/feature/app-shell.md,
 * docs/specs/page/landing.md
 */
export function ShellHeaderBar({
  variant,
  collapse,
  left,
  center = null,
  right,
  className,
}: ShellHeaderBarProps) {
  if (variant === "mobile") {
    return (
      <HeaderScrim
        collapse={collapse}
        className={cn("fixed inset-x-0 top-0 z-50 md:hidden", className)}
      >
        <div
          className={cn(
            "pointer-events-auto relative grid min-h-12 grid-cols-[1fr_1fr] items-center gap-x-2 px-4 pb-3",
            safeTop,
          )}
        >
          <div className="col-start-1 flex min-w-0 items-center gap-1 justify-self-start">
            {left}
          </div>
          {center}
          <div className="col-start-2 justify-self-end">{right}</div>
        </div>
      </HeaderScrim>
    );
  }

  return (
    <header className={cn("sticky top-0 z-50 hidden md:block", className)}>
      <HeaderScrim collapse={collapse}>
        <div className="relative mx-auto max-w-5xl px-6 py-3">
          <div className="grid min-h-11 grid-cols-[1fr_1fr] items-center gap-x-4">
            <div className="z-10 flex min-w-0 items-center gap-1 justify-self-start">{left}</div>
            <div className="z-10 flex min-w-0 items-center justify-self-end gap-1">{right}</div>
          </div>
          {center ? (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-0 flex items-center justify-center",
                desktopCenterReserve,
              )}
            >
              {center}
            </div>
          ) : null}
        </div>
      </HeaderScrim>
    </header>
  );
}
