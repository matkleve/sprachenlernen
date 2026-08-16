"use client";

import { BookOpen, Library, TrendingUp, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { routes } from "@/lib/routes";

export type ShellDestination = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** ADR-0009's three destinations — labels from appShell.destinations. */
export function useShellDestinations(): ShellDestination[] {
  const t = useTranslations("appShell");

  return useMemo(
    () => [
      { href: routes.methods, label: t("destinations.methods"), icon: Library },
      { href: routes.words, label: t("destinations.words"), icon: BookOpen },
      { href: routes.progress, label: t("destinations.progress"), icon: TrendingUp },
    ],
    [t],
  );
}
