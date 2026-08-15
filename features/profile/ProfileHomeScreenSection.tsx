"use client";

import { useEffect, useState } from "react";

import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/features/profile/content";
import { isStandaloneDisplay } from "@/lib/is-standalone-display";
import { routes } from "@/lib/routes";

/**
 * Home Screen install guidance on /profile (iPhone PWA scope quirk).
 * Contract: docs/specs/feature/pwa-install.md
 */
export function ProfileHomeScreenSection() {
  const [standalone, setStandalone] = useState<boolean | null>(null);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
  }, []);

  return (
    <section className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.homeScreenHeading}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.homeScreenCaption}</p>

      {standalone === true ? (
        <p className="mt-4 max-w-2xl text-sm font-medium text-success">{copy.homeScreenActive}</p>
      ) : null}

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{copy.homeScreenReinstall}</p>

      <div className="mt-4">
        <TextLink href={routes.install}>{copy.homeScreenInstallLink}</TextLink>
      </div>
    </section>
  );
}
