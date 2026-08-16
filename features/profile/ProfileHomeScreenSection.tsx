"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { isStandaloneDisplay } from "@/lib/is-standalone-display";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type HomeScreenScopeRow = {
  path: string;
  covers: string;
  recommended: boolean;
};

/**
 * Home Screen install guidance on /profile (iPhone PWA scope).
 * Contract: docs/specs/feature/pwa-install.md, docs/study/32-pwa-profile-ux.md
 */
export function ProfileHomeScreenSection() {
  const t = useTranslations("profile");
  const [standalone, setStandalone] = useState<boolean | null>(null);
  const scopeRows = t.raw("homeScreenScopeRows") as HomeScreenScopeRow[];

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
  }, []);

  return (
    <section className="mt-page-content" aria-labelledby="profile-home-screen-heading">
      <h2 id="profile-home-screen-heading" className="text-xl font-semibold text-ink">
        {t("homeScreenHeading")}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("homeScreenCaption")}</p>

      {standalone === true ? (
        <p
          className="mt-4 inline-flex rounded-pill border border-success bg-success-soft px-3 py-1 text-sm font-medium text-success"
          role="status"
        >
          {t("homeScreenActive")}
        </p>
      ) : null}

      <div className="mt-6 rounded-card border border-line bg-surface-raised p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-ink">{t("homeScreenScopeHeading")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("homeScreenScopeCaption")}</p>
        <dl className="mt-4 grid gap-3 text-sm">
          {scopeRows.map((row) => (
            <div
              key={row.path}
              className={cn(
                "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3 last:border-b-0 last:pb-0",
                row.recommended && "font-medium",
              )}
            >
              <dt className="font-mono text-ink">{row.path}</dt>
              <dd className="text-muted">{row.covers}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ActionLink href={routes.install} variant="primary" className="w-full sm:w-auto">
          {t("homeScreenInstallButton")}
        </ActionLink>
        <ActionLink href={routes.landing} variant="secondary" className="w-full sm:w-auto">
          {t("homeScreenMainSiteButton")}
        </ActionLink>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t("homeScreenReinstall")}</p>
    </section>
  );
}
