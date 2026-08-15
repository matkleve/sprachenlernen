"use client";

import { useEffect, useState } from "react";

import { isStandaloneDisplay } from "@/lib/is-standalone-display";
import { copy } from "@/features/safari-bisect/content";

type DisplayMode = "standalone" | "browser";

/**
 * Shows whether the page runs from the Home Screen icon or a browser tab.
 */
export function StandaloneModeReadout() {
  const [mode, setMode] = useState<DisplayMode | null>(null);

  useEffect(() => {
    setMode(isStandaloneDisplay() ? "standalone" : "browser");
  }, []);

  if (mode === null) return null;

  return (
    <p className="mt-1 text-[11px] text-ink">
      {copy.modeLabel}:{" "}
      <span className={mode === "standalone" ? "font-medium text-success" : "font-medium text-muted"}>
        {mode === "standalone" ? copy.modeStandalone : copy.modeBrowser}
      </span>
    </p>
  );
}
