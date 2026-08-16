"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { routes } from "@/lib/routes";

export type RouteEscape = {
  href: string;
  label: string;
};

/** Escape hatch when the shell does not already show destination nav as the primary recovery. */
export function useRouteEscape(pathname: string): RouteEscape | null {
  const t = useTranslations("appShell");

  return useMemo(() => {
    const onDestination =
      pathname === routes.methods ||
      pathname.startsWith("/methods/") ||
      pathname === routes.words ||
      pathname.startsWith("/words/") ||
      pathname === routes.progress ||
      pathname.startsWith("/progress/");

    if (onDestination) return null;

    return {
      href: routes.appHome,
      label: t("backTo", { destination: t("destinations.methods") }),
    };
  }, [pathname, t]);
}
