"use server";

import { redirect } from "next/navigation";

import { setActiveLanguage } from "@/lib/db/learning-languages";
import { setSpokenLanguage } from "@/lib/db/profiles";
import { routes } from "@/lib/routes";

/**
 * Profile server actions. Contract: docs/specs/page/profile.md
 *
 * Module-level actions so forms can bind a language code without crossing the
 * client boundary with inline page-scoped actions (those fail at render time).
 */
export async function switchProfileLanguageAction(languageCode: string): Promise<void> {
  const switched = await setActiveLanguage(languageCode);
  if (switched.status === "error") redirect(`${routes.profile}?failed`);
}

export async function changeSpokenLanguageAction(languageCode: string): Promise<void> {
  const changed = await setSpokenLanguage(languageCode);
  if (changed.status === "error") redirect(`${routes.profile}?spoken`);
}
