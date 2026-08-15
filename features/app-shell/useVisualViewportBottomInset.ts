"use client";

import { useEffect } from "react";

/** Set by useVisualViewportBottomInset — height of browser chrome below the layout viewport. */
export const VISUAL_VIEWPORT_BOTTOM_INSET_VAR = "--shell-visual-viewport-bottom-inset";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia === "function") {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
  }
  // Legacy iOS Safari home-screen install.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * iOS Safari's bottom toolbar is not in env(safe-area-inset-bottom) and it is
 * not always visible — /methods often runs without it, /words with it. Measure
 * the gap with visualViewport on resize only (scroll events jitter the inset
 * while the page moves). In standalone PWA there is no browser chrome — inset 0.
 */
export function useVisualViewportBottomInset() {
  useEffect(() => {
    if (isStandaloneDisplay()) {
      document.documentElement.style.setProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR, "0px");
      return () => {
        document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
      };
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR, `${inset}px`);
    };

    update();
    viewport.addEventListener("resize", update);
    window.addEventListener("resize", update);

    return () => {
      viewport.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    };
  }, []);
}
