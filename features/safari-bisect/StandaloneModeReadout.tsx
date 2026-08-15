"use client";

import { useEffect, useState } from "react";

import { copy } from "@/features/safari-bisect/content";

type DisplayMode = "standalone" | "browser";

function readDisplayMode(): DisplayMode {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  const matchMedia = typeof window.matchMedia === "function" ? window.matchMedia : null;

  if (
    navigatorWithStandalone.standalone === true ||
    matchMedia?.("(display-mode: standalone)").matches ||
    matchMedia?.("(display-mode: fullscreen)").matches
  ) {
    return "standalone";
  }
  return "browser";
}

/**
 * Shows whether the page runs in standalone PWA or an in-browser Safari tab.
 */
export function StandaloneModeReadout() {
  const [mode, setMode] = useState<DisplayMode | null>(null);

  useEffect(() => {
    setMode(readDisplayMode());
  }, []);

  if (mode === null) return null;

  return (
    <p className="mt-1 text-[11px] text-ink">
      {copy.modeLabel}:{" "}
      <span className={mode === "standalone" ? "font-medium text-success" : "font-medium text-danger"}>
        {mode === "standalone" ? copy.modeStandalone : copy.modeBrowser}
      </span>
    </p>
  );
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  return readDisplayMode() === "standalone";
}
