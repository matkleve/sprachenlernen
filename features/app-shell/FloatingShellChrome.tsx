"use client";

import { ArrowLeft, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import { IconLink } from "@/components/ui/IconLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { shellBackTarget } from "./back-target";
import { DestinationNavItems } from "./DestinationNavItems";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellPageTitle, shellHeaderStartsCompact } from "./ShellPageTitle";
import { HeaderScrim } from "./HeaderScrim";
import { copy } from "./content";
import { useHeaderCollapse } from "./useHeaderCollapse";

const safeTop = "pt-[max(1rem,env(safe-area-inset-top))]";
const safeBottom = "pb-[max(1rem,env(safe-area-inset-bottom))]";

/**
 * Mobile floating chrome: corner chips + bottom destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md
 */
export function FloatingShellChrome({
  languages,
  languageHoldings,
}: {
  languages: readonly LanguageSwitcherOption[];
  languageHoldings?: Record<string, LanguageHoldings>;
}) {
  const pathname = usePathname();
  const back = shellBackTarget(pathname);
  const collapse = useHeaderCollapse();
  const pinnedCompact = shellHeaderStartsCompact(pathname);

  return (
    <>
      <HeaderScrim
        collapse={pinnedCompact ? 1 : collapse}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 md:hidden"
      >
        <div
          className={cn(
            "relative flex min-h-11 items-center justify-between gap-3 px-4 pb-3",
            safeTop,
          )}
        >
          <div className="pointer-events-auto flex min-h-11 min-w-0 items-center gap-2">
            {back ? (
              <ActionLink
                href={back.href}
                variant="floating"
                size="sm"
                pendingPolicy="nav"
                className="gap-1.5"
              >
                <ArrowLeft aria-hidden className="size-4 shrink-0" />
                {back.label}
              </ActionLink>
            ) : (
              <LanguageSwitcher
                languages={languages}
                languageHoldings={languageHoldings}
                layout="floating"
              />
            )}
          </div>

          <ShellPageTitle variant="mobile" pinnedCompact={pinnedCompact} />

          <div className="pointer-events-auto">
            <IconLink href={routes.profile} aria-label={copy.account}>
              <UserRound aria-hidden className="size-5 shrink-0" />
            </IconLink>
          </div>
        </div>
      </HeaderScrim>

      <nav
        aria-label={copy.mobileNavLabel}
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4",
          safeBottom,
          "md:hidden",
        )}
      >
        <ul
          className={cn(
            "pointer-events-auto flex w-[min(85%,24rem)] list-none rounded-pill border border-line",
            "bg-surface p-1 shadow-raised",
          )}
        >
          <DestinationNavItems layout="pill" />
        </ul>
      </nav>
    </>
  );
}
