"use client";

import { ArrowLeft, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import { buttonVariants } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { shellBackTarget } from "./back-target";
import { DestinationNavItems } from "./DestinationNavItems";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
import { copy } from "./content";

const safeTop = "pt-[max(1rem,env(safe-area-inset-top))]";
const safeBottom = "pb-[max(1rem,env(safe-area-inset-bottom))]";

const cornerIconChipClass = cn(
  buttonVariants({ variant: "floating", size: "sm" }),
  "size-11 min-h-11 min-w-11 rounded-full p-0",
);

/**
 * Mobile floating chrome: corner chips + bottom destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md
 */
export function FloatingShellChrome({
  languages,
}: {
  languages: readonly LanguageSwitcherOption[];
}) {
  const pathname = usePathname();
  const back = shellBackTarget(pathname);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-4",
          safeTop,
          "md:hidden",
        )}
      >
        <div className="pointer-events-auto flex min-h-11 min-w-0 items-center gap-2">
          {back ? (
            <ActionLink
              href={back.href}
              variant="floating"
              size="sm"
              className="gap-1.5"
            >
              <ArrowLeft aria-hidden className="size-4 shrink-0" />
              {back.label}
            </ActionLink>
          ) : null}
          <LanguageSwitcher languages={languages} layout="floating" />
        </div>

        <div className="pointer-events-auto">
          <ActionLink
            href={routes.profile}
            variant="floating"
            size="sm"
            className={cornerIconChipClass}
            aria-label={copy.account}
          >
            <UserRound aria-hidden className="size-5 shrink-0" />
          </ActionLink>
        </div>
      </div>

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
