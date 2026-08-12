"use client";

import { ArrowLeft, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { IconLink } from "@/components/ui/IconLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { shellBackTarget } from "./back-target";
import { DestinationNavItems } from "./DestinationNavItems";
import { FooterScrim } from "./FooterScrim";
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
        className="fixed inset-x-0 top-0 z-50 md:hidden"
      >
        <div
          className={cn(
            "pointer-events-auto relative grid grid-cols-[1fr_minmax(0,11rem)_1fr] items-center gap-x-2 px-4 pb-3",
            safeTop,
          )}
        >
          <div className="col-start-1 flex min-w-0 items-center gap-2 justify-self-start">
            {back ? (
              <IconLink href={back.href} aria-label={copy.backTo(back.label)}>
                <ArrowLeft aria-hidden className="size-5 shrink-0" />
              </IconLink>
            ) : (
              <LanguageSwitcher
                languages={languages}
                languageHoldings={languageHoldings}
                layout="floating"
              />
            )}
          </div>

          <ShellPageTitle variant="mobile" pinnedCompact={pinnedCompact} />

          <div className="col-start-3 justify-self-end">
            <IconLink href={routes.profile} aria-label={copy.account}>
              <UserRound aria-hidden className="size-5 shrink-0" />
            </IconLink>
          </div>
        </div>
      </HeaderScrim>

      <FooterScrim className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <nav
          aria-label={copy.mobileNavLabel}
          className={cn("flex justify-center px-4", safeBottom)}
        >
          <ul
            className={cn(
              "flex w-[min(85%,24rem)] list-none rounded-pill border border-line",
              "bg-surface p-1.5 shadow-raised",
            )}
          >
            <DestinationNavItems layout="pill" />
          </ul>
        </nav>
      </FooterScrim>
    </>
  );
}
