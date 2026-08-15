"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { isStandaloneDisplay } from "@/lib/is-standalone-display";

/** Set by useVisualViewportBottomInset — height of browser chrome below the layout viewport. */
export const VISUAL_VIEWPORT_BOTTOM_INSET_VAR = "--shell-visual-viewport-bottom-inset";

function measureVisualViewportBottomInset(): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;

  // Standalone PWA has no Safari bottom toolbar. iOS can still report a phantom
  // visualViewport gap on some destination bodies (owner QA: Words/Progress only).
  if (isStandaloneDisplay()) return 0;

  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

function applyVisualViewportBottomInset(inset: number) {
  document.documentElement.style.setProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR, `${inset}px`);
}

/**
 * iOS Safari's bottom toolbar is not in env(safe-area-inset-bottom). It is
 * browser-controlled (gestures, session state) — not per-route. Measure the gap
 * with visualViewport and expose it as a CSS variable for the shell. Do not add
 * pathname-specific inset; see docs/study/29-ios-inset-by-route.md.
 *
 * Re-runs on pathname change so client navigations pick up layout after the new
 * page paints. In standalone PWA the inset is always 0 — there is no toolbar.
 */
export function useVisualViewportBottomInset() {
  const pathname = usePathname();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      applyVisualViewportBottomInset(measureVisualViewportBottomInset());
    };

    update();
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(update));
    afterPaint();

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    };
  }, [pathname]);
}
