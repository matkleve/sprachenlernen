"use client";

import { UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLink } from "@/components/brand/BrandLink";
import { IconLink } from "@/components/ui/IconLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";

import { DestinationNavItems } from "./DestinationNavItems";
import { isProfileCurrent } from "./destinations";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellHeaderBar } from "./ShellHeaderBar";
import { ShellPageTitle } from "./ShellPageTitle";
import { useTranslations } from "next-intl";
import { useHeaderCollapse } from "./useHeaderCollapse";

/**
 * Desktop signed-in header: brand + language left; destinations + account right.
 * Contract: docs/specs/feature/app-shell.md
 */
export function DesktopShellHeader({
  languages,
  languageHoldings,
}: {
  languages: readonly LanguageSwitcherOption[];
  languageHoldings?: Record<string, LanguageHoldings>;
}) {
  const pathname = usePathname();
  const t = useTranslations("appShell");
  const profileCurrent = isProfileCurrent(pathname);
  const collapse = useHeaderCollapse();

  return (
    <ShellHeaderBar
      variant="desktop"
      collapse={collapse}
      left={
        <>
          <BrandLink href={routes.methods} />
          <LanguageSwitcher
            languages={languages}
            languageHoldings={languageHoldings}
            layout="inline"
          />
        </>
      }
      center={<ShellPageTitle variant="desktop" />}
      right={
        <>
          <nav aria-label={t("navLabel")}>
            <ul className="flex items-center gap-1">
              <DestinationNavItems layout="header" />
            </ul>
          </nav>
          <IconLink
            href={routes.profile}
            aria-label={t("account")}
            current={profileCurrent}
          >
            <UserRound aria-hidden className="size-5 shrink-0" />
          </IconLink>
        </>
      }
    />
  );
}
