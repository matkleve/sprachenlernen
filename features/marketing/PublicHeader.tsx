"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/brand/BrandLockup";
import { BrandMark } from "@/components/brand/BrandMark";
import { ActionLink } from "@/components/ui/ActionLink";
import { ShellHeaderBar } from "@/features/app-shell/ShellHeaderBar";
import { useHeaderCollapse } from "@/features/app-shell/useHeaderCollapse";
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
 * Reuses `ShellHeaderBar` — same sticky/fixed chrome and scroll scrim as the
 * signed-in shell. Auth `aria-current` still needs the pathname client-side.
 */
export function PublicHeader({ signedIn }: PublicHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("marketing");
  const collapse = useHeaderCollapse();

  const mobileCenter = (
    <p
      className="pointer-events-none absolute top-1/2 left-1/2 max-w-[calc(100%-7rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center text-sm font-semibold tracking-tight text-ink"
    >
      {t("header.brand")}
    </p>
  );

  return (
    <>
      <ShellHeaderBar
        variant="mobile"
        collapse={collapse}
        left={
          <ActionLink
            href={routes.landing}
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            aria-label={site.name}
          >
            <BrandMark size="sm" tone="full" />
          </ActionLink>
        }
        center={mobileCenter}
        right={<PublicHeaderMenu signedIn={signedIn} />}
      />

      <ShellHeaderBar
        variant="desktop"
        collapse={collapse}
        left={
          <BrandLockup href={routes.landing} wordmark={t("header.brand")} tone="full" />
        }
        right={
          <nav className="flex items-center gap-3" aria-label="Account">
            <PublicHeaderAuthControls signedIn={signedIn} pathname={pathname} layout="inline" />
          </nav>
        }
      />
    </>
  );
}
