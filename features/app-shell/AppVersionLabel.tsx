"use client";

import { ArrowDownCircle } from "lucide-react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { cn } from "@/lib/utils";
import { useAppUpdateAvailable } from "./useAppUpdateAvailable";

/**
 * Build label or reload prompt under the mobile destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md, docs/specs/feature/app-update.md
 */
export function AppVersionLabel() {
  const t = useTranslations("appShell");
  const { stale, deployedLabel, reload } = useAppUpdateAvailable();

  if (stale && deployedLabel) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-auto min-h-0 gap-1 px-2 py-0 text-shell-version leading-none",
          "text-success hover:bg-success-soft active:bg-success-soft",
        )}
        aria-label={t("appUpdate.reloadAria", {
          nextVersion: deployedLabel,
          currentVersion: APP_VERSION_LABEL,
        })}
        onClick={reload}
      >
        <ArrowDownCircle aria-hidden className="size-3 shrink-0" />
        <span className="tabular-nums">{deployedLabel}</span>
      </Button>
    );
  }

  return (
    <p className="text-shell-version leading-none text-muted tabular-nums">{APP_VERSION_LABEL}</p>
  );
}
