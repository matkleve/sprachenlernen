"use client";

import { ArrowLeft, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { IconLink } from "@/components/ui/IconLink";
import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";

import { isProfileCurrent } from "./destinations";
import { useShellBackTarget } from "./use-shell-back-target";
import { AppVersionLabel } from "./AppVersionLabel";
import { DestinationNavItems } from "./DestinationNavItems";
import { FooterScrim } from "./FooterScrim";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { ShellHeaderBar } from "./ShellHeaderBar";
import { ShellPageTitle, shellHeaderStartsCompact } from "./ShellPageTitle";
import { useTranslations } from "next-intl";
import { useHeaderCollapse } from "./useHeaderCollapse";
import { useVisualViewportBottomInset } from "./useVisualViewportBottomInset";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("appShell");
  const profileCurrent = isProfileCurrent(pathname);
  const back = useShellBackTarget(pathname);
  const collapse = useHeaderCollapse();
  const pinnedCompact = shellHeaderStartsCompact(pathname);
  useVisualViewportBottomInset();

  return (
    <>
      <ShellHeaderBar
        variant="mobile"
        collapse={pinnedCompact ? 1 : collapse}
        left={
          back ? (
            <IconLink href={back.href} aria-label={t("backTo", { destination: back.label })}>
              <ArrowLeft aria-hidden className="size-5 shrink-0" />
            </IconLink>
          ) : (
            <LanguageSwitcher
              languages={languages}
              languageHoldings={languageHoldings}
              layout="floating"
            />
          )
        }
        center={<ShellPageTitle variant="mobile" pinnedCompact={pinnedCompact} />}
        right={
          <IconLink href={routes.profile} aria-label={t("account")} current={profileCurrent}>
            <UserRound aria-hidden className="size-5 shrink-0" />
          </IconLink>
        }
      />

      <FooterScrim className="md:hidden">
        <div className="flex w-full flex-col items-center gap-0.5">
          <nav aria-label={t("mobileNavLabel")} className="flex w-full justify-center">
            <ul
              className={cn(
                "inline-flex list-none items-center gap-1 rounded-pill border border-line",
                "bg-surface p-1 shadow-raised",
              )}
            >
              <DestinationNavItems layout="pill" />
            </ul>
          </nav>
          <AppVersionLabel />
        </div>
      </FooterScrim>
    </>
  );
}
