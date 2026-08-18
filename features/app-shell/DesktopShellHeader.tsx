"use client";

import { UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand/BrandMark";
import { ActionLink } from "@/components/ui/ActionLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site-metadata";

import { Destinations } from "./Destinations";
import { isProfileCurrent } from "./destinations";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellHeaderBar } from "./ShellHeaderBar";
import { ShellPageTitle } from "./ShellPageTitle";
import { useTranslations } from "next-intl";
import { useHeaderCollapse } from "./useHeaderCollapse";

/**
 * Desktop signed-in header: destinations, centered page title, account.
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
          <ActionLink
            href={routes.methods}
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            aria-label={site.name}
          >
            <BrandMark size="sm" />
          </ActionLink>
          <LanguageSwitcher
            languages={languages}
            languageHoldings={languageHoldings}
            layout="inline"
          />
          <Destinations />
        </>
      }
      center={<ShellPageTitle variant="desktop" />}
      right={
        <ActionLink
          href={routes.profile}
          variant="ghost"
          size="sm"
          current={profileCurrent}
          className="shrink-0 gap-1.5"
        >
          <UserRound aria-hidden className="size-4 shrink-0" />
          {t("account")}
        </ActionLink>
      }
    />
  );
}
