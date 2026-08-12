"use client";

import { UserRound } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { Destinations } from "./Destinations";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellPageTitle } from "./ShellPageTitle";
import { copy } from "./content";
import { headerBackdropClass } from "./header-chrome";
import { useHeaderCollapse } from "./useHeaderCollapse";

/**
 * Desktop signed-in header: destinations, centered page title, account.
 * Contract: docs/specs/feature/app-shell.md
 */
export function DesktopShellHeader({
  languages,
}: {
  languages: readonly LanguageSwitcherOption[];
}) {
  const collapse = useHeaderCollapse();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden md:block",
        headerBackdropClass(collapse),
      )}
    >
      <div className="relative mx-auto max-w-5xl px-6 py-3">
        <ShellPageTitle variant="desktop" />

        <div className="relative z-10 flex min-h-11 items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <LanguageSwitcher languages={languages} layout="inline" />
            <Destinations />
          </div>

          <ActionLink href={routes.profile} variant="ghost" size="sm" className="gap-1.5">
            <UserRound aria-hidden className="size-4 shrink-0" />
            {copy.account}
          </ActionLink>
        </div>
      </div>
    </header>
  );
}
