"use client";

import { useTranslations } from "next-intl";

import { routes } from "@/lib/routes";

/**
 * Visible page title for the shell header. Contract: docs/specs/feature/app-shell.md
 *
 * Mirrors each route's document title / h1 so the header and tab cannot drift.
 */
export function useShellPageTitle(pathname: string): string {
  const t = useTranslations("appShell");
  const tMethodMenu = useTranslations("methodMenu");
  const tProgress = useTranslations("progress");
  const tReview = useTranslations("reviewSession");
  const tProfile = useTranslations("profile");
  const tLanguagePicker = useTranslations("languagePicker");

  if (pathname === routes.methods) return tMethodMenu("title");
  if (pathname === routes.words) return t("holding.words.title");
  if (pathname === routes.wordsBisect) return "Words bisect";
  if (pathname === routes.progress) return tProgress("title");
  if (pathname === routes.progressBisect) return "Progress bisect";
  if (pathname === routes.safariBisect) return "Safari bisect";
  if (pathname === routes.wordsReview) return tReview("title");
  if (pathname === routes.profile) return tProfile("title");
  if (pathname === routes.chooseLanguage) return tLanguagePicker("title");

  if (pathname.startsWith(`${routes.methods}/`)) {
    return tMethodMenu("drillInShellTitle");
  }

  return "";
}
