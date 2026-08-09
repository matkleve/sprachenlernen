"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavLink } from "@/components/ui/NavLink";
import { buttonVariants } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
        <Link
          href={routes.landing}
          className="text-sm font-semibold tracking-tight text-ink transition-colors duration-150 ease-out-soft hover:text-accent active:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {copy.header.brand}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Account">
          <NavLink href={routes.signIn} current={pathname === routes.signIn}>
            {copy.header.signIn}
          </NavLink>
          <Link
            href={routes.signUp}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            {copy.header.signUp}
          </Link>
        </nav>
      </div>
    </header>
  );
}
