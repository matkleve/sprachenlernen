"use client";

import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signOutAction } from "@/features/app-shell/actions";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type PublicHeaderAuthControlsProps = {
  signedIn: boolean;
  pathname: string;
  layout: "inline" | "menu";
  onNavigate?: () => void;
};

/** Auth links for the public header — inline on desktop, inside the mobile menu. */
export function PublicHeaderAuthControls({
  signedIn,
  pathname,
  layout,
  onNavigate,
}: PublicHeaderAuthControlsProps) {
  const t = useTranslations("marketing");
  const menuLayout = layout === "menu";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        menuLayout && "w-full flex-col items-stretch",
      )}
    >
      {signedIn ? (
        <>
          <form action={signOutAction} className={cn(menuLayout && "w-full")}>
            <SubmitButton variant="ghost" size="sm" className={cn(menuLayout && "w-full")}>
              {t("header.signOut")}
            </SubmitButton>
          </form>
          <ActionLink
            href={routes.appHome}
            variant="primary"
            size="sm"
            className={cn(menuLayout && "w-full")}
            onClick={onNavigate}
          >
            {t("header.toApp")}
          </ActionLink>
        </>
      ) : (
        <>
          <ActionLink
            href={routes.signIn}
            variant="ghost"
            size="sm"
            className={cn(menuLayout && "w-full")}
            aria-current={pathname === routes.signIn ? "page" : undefined}
            onClick={onNavigate}
          >
            {t("header.signIn")}
          </ActionLink>
          <ActionLink
            href={routes.signUp}
            variant="primary"
            size="sm"
            className={cn(menuLayout && "w-full")}
            aria-current={pathname === routes.signUp ? "page" : undefined}
            onClick={onNavigate}
          >
            {t("header.signUp")}
          </ActionLink>
        </>
      )}
    </div>
  );
}
