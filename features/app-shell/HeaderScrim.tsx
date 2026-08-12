"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeaderScrimProps = {
  /** 0 at scroll top, 1 when collapsed — drives scrim visibility. */
  collapse: number;
  className?: string;
  children: ReactNode;
};

/**
 * Scroll scrim behind the shell header: blur + surface tint, fading out toward
 * the bottom edge. Contract: docs/specs/feature/app-shell.md
 */
export function HeaderScrim({ collapse, className, children }: HeaderScrimProps) {
  const active = collapse > 0.02;

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -bottom-4",
          "transition-opacity duration-150 motion-reduce:transition-none",
          active ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="header-scrim-blur absolute inset-0" />
        <div className="header-scrim-tint absolute inset-0" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
