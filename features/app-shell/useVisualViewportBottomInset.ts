"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Set by useVisualViewportBottomInset — height of browser chrome below the layout viewport. */
export const VISUAL_VIEWPORT_BOTTOM_INSET_VAR = "--shell-visual-viewport-bottom-inset";

/** Read the gap Safari (or any browser) leaves below the layout viewport. */
export function readVisualViewportBottomInset(): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

/** Write the measured inset to `:root` for shell CSS. */
export function syncVisualViewportBottomInset(): void {
  document.documentElement.style.setProperty(
    VISUAL_VIEWPORT_BOTTOM_INSET_VAR,
    `${readVisualViewportBottomInset()}px`,
  );
}

/**
 * iOS Safari's bottom toolbar is not in env(safe-area-inset-bottom). Safari
 * controls show/hide (gestures, bottom-edge taps) — there is no per-route API.
 * Measure with visualViewport and expose a CSS variable. Re-sync on pathname
 * change because the shell stays mounted across Next.js navigations and Safari
 * may not fire resize when only the URL changes. No pathname-specific values.
 * Study: docs/study/29-ios-inset-by-route.md
 */
export function useVisualViewportBottomInset() {
  const pathname = usePathname();

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => syncVisualViewportBottomInset();

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

  // Shell does not unmount on pill navigation — remeasure when the route changes.
  useEffect(() => {
    syncVisualViewportBottomInset();
  }, [pathname]);
}
