"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FooterScrimProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Mobile footer chrome: scrim bleeds to the viewport bottom (behind Safari toolbar);
 * the destination pill sits above measured browser chrome with vertical padding.
 * Contract: mobile-nav-v2.md, page-layout.layers.md
 */
export function FooterScrim({ className, children }: FooterScrimProps) {
  return (
    <div className={cn("shell-float-footer-scrim fixed inset-x-0 bottom-0 z-50", className)}>
      <div aria-hidden className="pointer-events-auto absolute inset-0">
        <div className="footer-scrim-blur absolute inset-0" />
        <div className="footer-scrim-tint absolute inset-0" />
      </div>
      <div className={cn("shell-float-nav-pill absolute inset-x-0 z-10 flex justify-center px-4")}>
        {children}
      </div>
    </div>
  );
}
