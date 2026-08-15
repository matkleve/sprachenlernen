"use client";

import { useEffect } from "react";

/** Set by useVisualViewportBottomInset — height of browser chrome below the layout viewport. */
export const VISUAL_VIEWPORT_BOTTOM_INSET_VAR = "--shell-visual-viewport-bottom-inset";

/**
 * iOS Safari's bottom toolbar is not in env(safe-area-inset-bottom). It is
 * browser-controlled (gestures, session state) — not per-route. Measure the gap
 * with visualViewport and expose it as a CSS variable for the shell. Do not add
 * pathname-specific inset; see docs/study/29-ios-inset-by-route.md.
 */
export function useVisualViewportBottomInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR, `${inset}px`);
    };

    update();
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
  }, []);
}
