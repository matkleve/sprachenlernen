"use client";

import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { useAppUpdateAvailable } from "./useAppUpdateAvailable";

/**
 * Muted build label under the mobile destination pill when no update is pending.
 * Contract: docs/specs/feature/mobile-nav-v2.md, docs/specs/feature/app-update.md
 */
export function AppVersionLabel() {
  const { stale } = useAppUpdateAvailable();

  if (stale) {
    return null;
  }

  return (
    <p className="text-shell-version leading-none text-muted tabular-nums">{APP_VERSION_LABEL}</p>
  );
}
