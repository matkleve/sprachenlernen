"use client";

import { ArrowLeft, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/utils";

import { shellBackTarget } from "./back-target";
import { DestinationNavItems } from "./DestinationNavItems";
import { signOutAction } from "./actions";
import { copy } from "./content";

const safeTop = "pt-[max(1rem,env(safe-area-inset-top))]";
const safeBottom = "pb-[max(1rem,env(safe-area-inset-bottom))]";

/**
 * Mobile floating chrome: corner chips + bottom destination pill.
 * Contract: docs/specs/feature/mobile-nav-v2.md
 */
export function FloatingShellChrome() {
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
        <div className="pointer-events-auto min-h-11">
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
        </div>

        <form action={signOutAction} className="pointer-events-auto">
          <SubmitButton variant="floating" size="sm" className="gap-1.5">
            <LogOut aria-hidden className="size-4 shrink-0" />
            {copy.signOut}
          </SubmitButton>
        </form>
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
