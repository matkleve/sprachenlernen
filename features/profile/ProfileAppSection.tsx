"use client";

import { ArrowDownCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAppUpdateAvailable } from "@/features/app-shell/useAppUpdateAvailable";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { useTranslations } from "next-intl";

/**
 * App version and update check on /profile.
 * Contract: docs/specs/page/profile.md, docs/specs/feature/app-update.md
 */
export function ProfileAppSection() {
  const t = useTranslations("profile");
  const { stale, deployedLabel, reload, check, checking } = useAppUpdateAvailable();

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{t("appHeading")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("appCaption")}</p>

      <dl className="mt-6 grid gap-1 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <dt className="text-muted">{t("runningVersion")}</dt>
          <dd className="font-medium tabular-nums text-ink">{APP_VERSION_LABEL}</dd>
        </div>
      </dl>

      {stale && deployedLabel ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-success-soft px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <ArrowDownCircle aria-hidden className="size-4 shrink-0" />
            <span>{t("updateAvailable", { version: deployedLabel })}</span>
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="border-success text-success hover:border-success-deep hover:bg-surface"
            aria-label={t("reloadAria", {
              nextVersion: deployedLabel,
              currentVersion: APP_VERSION_LABEL,
            })}
            onClick={reload}
          >
            {t("reload")}
          </Button>
        </div>
      ) : null}

      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          pending={checking}
          disabled={checking}
          onClick={() => {
            void check();
          }}
        >
          {t("checkForUpdates")}
        </Button>
      </div>
    </section>
  );
}
