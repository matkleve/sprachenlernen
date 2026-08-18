"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/brand/BrandLockup";
import { BrandMark } from "@/components/brand/BrandMark";
import { ActionLink } from "@/components/ui/ActionLink";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site-metadata";

import { PublicHeaderAuthControls } from "./PublicHeaderAuthControls";
import { PublicHeaderMenu } from "./PublicHeaderMenu";

type PublicHeaderProps = {
  signedIn: boolean;
};

/**
 * The frame every public page renders inside. Contract:
 * docs/specs/page/landing.md
 *
 * A client leaf only because `aria-current` on the sign-in link must follow the
 * URL — the same reason Destinations is a client component in the app shell.
 * `signedIn` is read server-side in the marketing layout and passed down.
 */
export function PublicHeader({ signedIn }: PublicHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("marketing");

  return (
    <header className="border-b border-line bg-surface">
      <div className="relative grid min-h-12 grid-cols-[1fr_1fr] items-center gap-x-2 px-4 py-3 md:hidden">
        <div className="col-start-1 flex min-w-0 items-center justify-self-start">
          <ActionLink
            href={routes.landing}
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            aria-label={site.name}
          >
            <BrandMark size="sm" tone="full" />
          </ActionLink>
        </div>

        <p className="pointer-events-none absolute top-1/2 left-1/2 max-w-[calc(100%-7rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center text-sm font-semibold tracking-tight text-ink">
          {t("header.brand")}
        </p>

        <div className="col-start-2 justify-self-end">
          <PublicHeaderMenu signedIn={signedIn} />
        </div>
      </div>

      <div className="mx-auto hidden max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3 md:flex">
        <BrandLockup href={routes.landing} wordmark={t("header.brand")} tone="full" />
        <nav className="flex items-center gap-3" aria-label="Account">
          <PublicHeaderAuthControls signedIn={signedIn} pathname={pathname} layout="inline" />
        </nav>
      </div>
    </header>
  );
}
