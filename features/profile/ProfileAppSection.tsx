"use client";

import { ArrowDownCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAppUpdateAvailable } from "@/features/app-shell/useAppUpdateAvailable";
import { copy } from "@/features/profile/content";
import { APP_VERSION_LABEL } from "@/lib/pride-version";

function formatLastChecked(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

/**
 * App version and update check on /profile.
 * Contract: docs/specs/page/profile.md, docs/specs/feature/app-update.md
 */
export function ProfileAppSection() {
  const { stale, deployedLabel, reload, check, checking, lastCheckedAt } =
    useAppUpdateAvailable();

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.appHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.appCaption}</p>

      <dl className="mt-6 grid gap-1 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <dt className="text-muted">{copy.runningVersion}</dt>
          <dd className="font-medium tabular-nums text-ink">{APP_VERSION_LABEL}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <dt className="text-muted">{copy.lastChecked}</dt>
          <dd className="font-medium tabular-nums text-ink">
            {lastCheckedAt ? formatLastChecked(lastCheckedAt) : copy.lastCheckedPending}
          </dd>
        </div>
      </dl>

      {stale && deployedLabel ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-success-soft px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <ArrowDownCircle aria-hidden className="size-4 shrink-0" />
            <span>{copy.updateAvailable(deployedLabel)}</span>
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="border-success text-success hover:border-success-deep hover:bg-surface"
            aria-label={copy.reloadAria(deployedLabel, APP_VERSION_LABEL)}
            onClick={reload}
          >
            {copy.reload}
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
          {copy.checkForUpdates}
        </Button>
      </div>
    </section>
  );
}
