"use client";

import { UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { Destinations } from "./Destinations";
import { isProfileCurrent, shellNavCurrentClass } from "./destinations";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellPageTitle } from "./ShellPageTitle";
import { HeaderScrim } from "./HeaderScrim";
import { copy } from "./content";
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
  const profileCurrent = isProfileCurrent(pathname);
  const collapse = useHeaderCollapse();

  return (
    <header className="sticky top-0 z-50 hidden md:block">
      <HeaderScrim collapse={collapse}>
        <div className="relative mx-auto max-w-5xl px-6 py-3">
        <ShellPageTitle variant="desktop" />

        <div className="relative z-10 flex min-h-11 items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <LanguageSwitcher
              languages={languages}
              languageHoldings={languageHoldings}
              layout="inline"
            />
            <Destinations />
          </div>

          <ActionLink
            href={routes.profile}
            variant="ghost"
            size="sm"
            aria-current={profileCurrent ? "page" : undefined}
            className={cn("gap-1.5", profileCurrent && shellNavCurrentClass)}
          >
            <UserRound aria-hidden className="size-4 shrink-0" />
            {copy.account}
          </ActionLink>
        </div>
        </div>
      </HeaderScrim>
    </header>
  );
}
