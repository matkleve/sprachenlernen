"use client";

import { useEffect, useState } from "react";

import { VISUAL_VIEWPORT_BOTTOM_INSET_VAR } from "@/features/app-shell/useVisualViewportBottomInset";
import { isStandaloneDisplay } from "@/lib/is-standalone-display";
import { copy } from "@/features/safari-bisect/content";

/**
 * Live readout for owner PWA QA on bisect routes.
 */
export function InsetReadout() {
  const [inset, setInset] = useState("—");

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        VISUAL_VIEWPORT_BOTTOM_INSET_VAR,
      );
      setInset(value.trim() || "0px");
    };

    read();
    window.visualViewport?.addEventListener("resize", read);
    window.visualViewport?.addEventListener("scroll", read);
    window.addEventListener("resize", read);

    return () => {
      window.visualViewport?.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return (
    <p className="mt-1 font-mono text-[11px] text-ink">
      {copy.insetLabel}: <span className="tabular-nums">{inset}</span>
    </p>
  );
}
