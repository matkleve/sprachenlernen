"use client";

import { ArrowDownCircle } from "lucide-react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { cn } from "@/lib/utils";
import { useAppUpdateAvailable } from "./useAppUpdateAvailable";

/**
 * Tappable update chip above the mobile destination pill when a newer build is deployed.
 * Contract: docs/specs/feature/app-update.md, docs/specs/feature/mobile-nav-v2.md
 */
export function AppUpdateChip() {
  const t = useTranslations("appShell.appUpdate");
  const { stale, deployedLabel, reload } = useAppUpdateAvailable();

  if (!stale || !deployedLabel) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-auto min-h-0 gap-1 rounded-pill border border-success bg-success-soft px-2.5 py-0.5",
        "text-xs font-medium text-success",
        "hover:border-success-deep hover:bg-success-soft active:bg-success-soft",
      )}
      aria-label={t("reloadAria", {
        nextVersion: deployedLabel,
        currentVersion: APP_VERSION_LABEL,
      })}
      onClick={reload}
    >
      <ArrowDownCircle aria-hidden className="size-3 shrink-0" />
      <span>{t("updateAvailable")}</span>
    </Button>
  );
}
