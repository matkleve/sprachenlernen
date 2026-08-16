"use client";

import { useTranslations } from "next-intl";

import { DestinationNavItems } from "./DestinationNavItems";

/**
 * Desktop destination links (≥ md). Contract: docs/specs/feature/app-shell.md
 *
 * Desktop header only — docs/specs/feature/mobile-nav-v2.md.
 */
export function Destinations() {
  const t = useTranslations("appShell");

  return (
    <nav aria-label={t("navLabel")}>
      <ul className="flex items-center gap-1">
        <DestinationNavItems layout="header" />
      </ul>
    </nav>
  );
}
