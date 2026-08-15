"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setActiveLanguage } from "@/lib/db/learning-languages";
import { setSpokenLanguage } from "@/lib/db/profiles";
import { routes } from "@/lib/routes";

/**
 * Profile server actions. Contract: docs/specs/page/profile.md
 *
 * Called from client profile blocks via useTransition — not through forms
 * crossing the LanguageListRow client boundary (that fails in production).
 */
export async function switchProfileLanguageAction(languageCode: string): Promise<void> {
  const switched = await setActiveLanguage(languageCode);
  if (switched.status === "error") redirect(`${routes.profile}?failed`);
  revalidatePath("/", "layout");
}

export async function changeSpokenLanguageAction(languageCode: string): Promise<void> {
  const changed = await setSpokenLanguage(languageCode);
  if (changed.status === "error") redirect(`${routes.profile}?spoken`);
  revalidatePath(routes.profile);
}
