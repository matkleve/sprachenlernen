"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/ui/ActionLink";
import { NavLink } from "@/components/ui/NavLink";
import { routes } from "@/lib/routes";

import { HeaderBrandLockup } from "./HeaderBrandLockup";

/**
 * The frame every public page renders inside. Contract:
 * docs/specs/page/landing.md
 *
 * A client leaf only because `aria-current` on the sign-in link must follow the
 * URL — the same reason Destinations is a client component in the app shell.
 */
export function PublicHeader() {
  const pathname = usePathname();
  const t = useTranslations("marketing");

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <HeaderBrandLockup wordmark={t("header.brand")} />
        <nav className="flex items-center gap-1" aria-label="Account">
          <NavLink href={routes.signIn} current={pathname === routes.signIn}>
            {t("header.signIn")}
          </NavLink>
          <ActionLink href={routes.signUp} variant="primary" size="sm">
            {t("header.signUp")}
          </ActionLink>
        </nav>
      </div>
    </header>
  );
}
