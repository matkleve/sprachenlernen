"use client";

import { useTranslations } from "next-intl";

import { routes } from "@/lib/routes";

import { useShellDestinations } from "./use-shell-destinations";

export type ShellBackTarget = {
  href: string;
  label: string;
};

/**
 * Parent destination for drill-in routes. Contract:
 * docs/specs/feature/mobile-nav-v2.md § Back targets
 */
export function useShellBackTarget(pathname: string): ShellBackTarget | null {
  const destinations = useShellDestinations();
  const t = useTranslations("contentTrace");

  if (pathname.startsWith(`${routes.content}/`)) {
    return { href: routes.content, label: t("library.title") };
  }

  for (const { href, label } of destinations) {
    if (pathname.startsWith(`${href}/`)) {
      return { href, label };
    }
  }

  return null;
}
