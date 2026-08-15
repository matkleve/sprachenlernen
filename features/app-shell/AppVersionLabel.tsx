"use client";

import { Button } from "@/components/ui/Button";
import { APP_VERSION_LABEL } from "@/lib/pride-version";

import { copy } from "./content";
import { useAppUpdateAvailable } from "./useAppUpdateAvailable";

/**
 * Build label or reload prompt under the mobile destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md, docs/specs/feature/app-update.md
 */
export function AppVersionLabel() {
  const { stale, reload } = useAppUpdateAvailable();

  if (stale) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto min-h-0 px-2 py-0 text-shell-version leading-none text-accent hover:bg-transparent"
        aria-label={copy.appUpdate.reloadAria}
        onClick={reload}
      >
        {copy.appUpdate.reload}
      </Button>
    );
  }

  return (
    <p className="text-shell-version leading-none text-muted tabular-nums">{APP_VERSION_LABEL}</p>
  );
}
