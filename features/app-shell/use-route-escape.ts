"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { readNavigationPrevious } from "@/features/app-shell/navigation-history";
import {
  routeEscapeDestination,
  routeEscapeHref,
} from "@/features/app-shell/resolve-route-escape";
import { routes } from "@/lib/routes";

import { useShellDestinations } from "./use-shell-destinations";

export type RouteEscape = {
  href: string;
  label: string;
};

function isDestinationRoute(pathname: string): boolean {
  return (
    pathname === routes.methods ||
    pathname.startsWith("/methods/") ||
    pathname === routes.words ||
    pathname.startsWith("/words/") ||
    pathname === routes.progress ||
    pathname.startsWith("/progress/")
  );
}

/** Escape hatch when the shell does not already show destination nav as the primary recovery. */
export function useRouteEscape(pathname: string): RouteEscape | null {
  const t = useTranslations("appShell");
  const tContent = useTranslations("contentTrace");
  const destinations = useShellDestinations();

  return useMemo(() => {
    if (isDestinationRoute(pathname)) return null;

    const previousPath = readNavigationPrevious();
    if (previousPath && previousPath !== pathname) {
      const href = routeEscapeHref(previousPath);
      const destination = routeEscapeDestination(previousPath);

      if (destination === "profile") {
        return { href, label: t("backTo", { destination: t("account") }) };
      }

      if (destination === "content") {
        return { href, label: t("backTo", { destination: tContent("library.title") }) };
      }

      const shellDestination = destinations.find((entry) => entry.href === href);
      if (shellDestination) {
        return { href, label: t("backTo", { destination: shellDestination.label }) };
      }
    }

    const methods = destinations.find((entry) => entry.href === routes.appHome);
    return {
      href: routes.appHome,
      label: t("backTo", { destination: methods?.label ?? t("destinations.methods") }),
    };
  }, [pathname, t, tContent, destinations]);
}
