"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FooterScrimProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Scrim behind the mobile bottom destination pill — blur + tint fading upward,
 * matching the header scrim at the top. The full-width tap shield stops presses
 * on the pill's dead zones from reaching page content underneath.
 * Contract: mobile-nav-v2.md
 */
export function FooterScrim({ className, children }: FooterScrimProps) {
  return (
    <div className={cn("relative isolate w-full", className)}>
      <div
        aria-hidden
        className="pointer-events-auto absolute inset-x-0 -top-10 bottom-0"
      >
        <div className="footer-scrim-blur absolute inset-0" />
        <div className="footer-scrim-tint absolute inset-0" />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
