"use client";

import { LayoutGrid, LogIn, LogOut, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { iconButtonClass, iconPrimaryButtonClass } from "@/components/ui/Button";
import { IconLink } from "@/components/ui/IconLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signOutAction } from "@/features/app-shell/actions";
import { routes } from "@/lib/routes";

type PublicHeaderAuthControlsProps = {
  signedIn: boolean;
  pathname: string;
  layout: "inline" | "menu";
  onNavigate?: () => void;
};

/** Auth controls for the public header — icon chips inline, labelled rows in menu. */
export function PublicHeaderAuthControls({
  signedIn,
  pathname,
  layout,
  onNavigate,
}: PublicHeaderAuthControlsProps) {
  const t = useTranslations("marketing");
  const menuLayout = layout === "menu";

  if (menuLayout) {
    return (
      <div className="flex w-full flex-col items-stretch gap-3">
        {signedIn ? (
          <>
            <form action={signOutAction} className="w-full">
              <SubmitButton variant="ghost" size="sm" className="w-full">
                {t("header.signOut")}
              </SubmitButton>
            </form>
            <ActionLink
              href={routes.appHome}
              variant="primary"
              size="sm"
              className="w-full"
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
              className="w-full"
              aria-current={pathname === routes.signIn ? "page" : undefined}
              onClick={onNavigate}
            >
              {t("header.signIn")}
            </ActionLink>
            <ActionLink
              href={routes.signUp}
              variant="primary"
              size="sm"
              className="w-full"
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

  return (
    <div className="flex items-center gap-1">
      {signedIn ? (
        <>
          <form action={signOutAction}>
            <SubmitButton
              variant="floating"
              size="sm"
              className={iconButtonClass}
              aria-label={t("header.signOut")}
            >
              <LogOut aria-hidden className="size-5 shrink-0" />
            </SubmitButton>
          </form>
          <ActionLink
            href={routes.appHome}
            className={iconPrimaryButtonClass}
            aria-label={t("header.toApp")}
            onClick={onNavigate}
          >
            <LayoutGrid aria-hidden className="size-5 shrink-0" />
          </ActionLink>
        </>
      ) : (
        <>
          <IconLink
            href={routes.signIn}
            aria-label={t("header.signIn")}
            aria-current={pathname === routes.signIn ? "page" : undefined}
            onClick={onNavigate}
          >
            <LogIn aria-hidden className="size-5 shrink-0" />
          </IconLink>
          <ActionLink
            href={routes.signUp}
            className={iconPrimaryButtonClass}
            aria-label={t("header.signUp")}
            aria-current={pathname === routes.signUp ? "page" : undefined}
            onClick={onNavigate}
          >
            <UserPlus aria-hidden className="size-5 shrink-0" />
          </ActionLink>
        </>
      )}
    </div>
  );
}
