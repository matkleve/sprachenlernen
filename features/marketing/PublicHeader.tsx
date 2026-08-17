"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/brand/BrandLockup";
import { ActionLink } from "@/components/ui/ActionLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signOutAction } from "@/features/app-shell/actions";
import { routes } from "@/lib/routes";

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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <BrandLockup href={routes.landing} wordmark={t("header.brand")} tone="full" />
        <nav className="flex items-center gap-3" aria-label="Account">
          {signedIn ? (
            <>
              <form action={signOutAction}>
                <SubmitButton variant="ghost" size="sm">
                  {t("header.signOut")}
                </SubmitButton>
              </form>
              <ActionLink href={routes.appHome} variant="primary" size="sm">
                {t("header.toApp")}
              </ActionLink>
            </>
          ) : (
            <>
              <ActionLink
                href={routes.signIn}
                variant="ghost"
                size="sm"
                aria-current={pathname === routes.signIn ? "page" : undefined}
              >
                {t("header.signIn")}
              </ActionLink>
              <ActionLink
                href={routes.signUp}
                variant="primary"
                size="sm"
                aria-current={pathname === routes.signUp ? "page" : undefined}
              >
                {t("header.signUp")}
              </ActionLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
