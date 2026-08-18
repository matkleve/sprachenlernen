"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setActiveLanguage } from "@/lib/db/learning-languages";
import { signOut } from "@/lib/db/auth";
import {
  readLanguageHoldings,
  type LanguageHoldings,
} from "@/lib/db/language-holdings";
import { routes } from "@/lib/routes";

/**
 * Contract: docs/specs/feature/app-shell.md
 *
 * A Server Action bound to a form, so signing out is a POST and cannot happen
 * because something prefetched a link.
 *
 * A failed sign-out throws rather than redirecting: landing on `/` while the
 * session cookie is still valid would show the public page to somebody the app
 * still considers signed in, which is a silent failure of exactly the kind
 * CONSTITUTION.md §3 rules out. The error boundary is loud and correct.
 */
export async function signOutAction(): Promise<void> {
  const result = await signOut();
  if (result.status === "error") throw new Error(result.error);
  redirect(routes.landing);
}

/** Switches the interface's active learning language and refreshes the shell. */
export async function switchActiveLanguageAction(languageCode: string): Promise<void> {
  const result = await setActiveLanguage(languageCode);
  if (result.status === "error") throw new Error(result.error);
  revalidatePath("/", "layout");
}

/** Holdings for the language switcher — loaded on first open, not every navigation. */
export async function loadLanguageHoldingsAction(
  languageCodes: string[],
): Promise<Record<string, LanguageHoldings> | null> {
  const outcome = await readLanguageHoldings(languageCodes);
  return outcome.status === "ok" ? outcome.byCode : null;
}
