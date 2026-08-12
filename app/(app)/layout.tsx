import type { ReactNode } from "react";

import { AppShell } from "@/features/app-shell/AppShell";
import { requireAccount } from "@/features/app-shell/gate";
import { switcherOptionsFrom } from "@/features/app-shell/reading";
import { readLanguageHoldings } from "@/lib/db/language-holdings";
import { listLearningLanguages } from "@/lib/db/learning-languages";

/**
 * The signed-in half of the app (ADR-0010). Every route in this group is
 * behind an account and inside the shell; the public half is app/(marketing)/
 * and gets neither. Route groups do not appear in the URL.
 */
/**
 * Nothing under this group may be prerendered. Every page here reads the auth
 * cookie through `requireAccount()`, so a static copy would be one learner's
 * page served to the next. Next infers that from `cookies()` — but only if it
 * gets that far: `createServerSupabaseClient()` reads the environment first
 * and throws when it is unset, which turns a missing `.env.local` into a
 * failed *build* rather than a failed request. Declaring it removes both the
 * inference and the ordering it depends on.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireAccount();
  const outcome = await listLearningLanguages();
  const languages = switcherOptionsFrom(outcome);
  const holdings =
    outcome.status === "ok"
      ? await readLanguageHoldings(outcome.languages.map((language) => language.languageCode))
      : { status: "error" as const, error: "" };

  return (
    <AppShell
      languages={languages}
      languageHoldings={holdings.status === "ok" ? holdings.byCode : undefined}
    >
      {children}
    </AppShell>
  );
}
