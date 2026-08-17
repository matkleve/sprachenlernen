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
import { ShellPageTitle } from "./ShellPageTitle";
import { HeaderScrim } from "./HeaderScrim";
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
    <header className="sticky top-0 z-50 hidden md:block">
      <HeaderScrim collapse={collapse}>
        <div className="mx-auto grid min-h-11 max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-x-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-4 justify-self-start">
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
          </div>

          <ShellPageTitle variant="desktop" />

          <ActionLink
            href={routes.profile}
            variant="ghost"
            size="sm"
            current={profileCurrent}
            className="shrink-0 justify-self-end gap-1.5"
          >
            <UserRound aria-hidden className="size-4 shrink-0" />
            {t("account")}
          </ActionLink>
        </div>
      </HeaderScrim>
    </header>
  );
}
