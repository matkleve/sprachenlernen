"use client";

import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import { NavLink } from "@/components/ui/NavLink";
import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/lib/routes";

import { copy } from "./content";

/**
 * The frame every public page renders inside. Contract:
 * docs/specs/page/landing.md
 *
 * A client leaf only because `aria-current` on the sign-in link must follow the
 * URL — the same reason Destinations is a client component in the app shell.
 */
export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <TextLink href={routes.landing} tone="ink" size="sm" className="no-underline hover:underline">
          {copy.header.brand}
        </TextLink>
        <nav className="flex items-center gap-1" aria-label="Account">
          <NavLink href={routes.signIn} current={pathname === routes.signIn}>
            {copy.header.signIn}
          </NavLink>
          <ActionLink href={routes.signUp} variant="primary" size="sm">
            {copy.header.signUp}
          </ActionLink>
        </nav>
      </div>
    </header>
  );
}
