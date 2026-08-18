import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/features/app-shell/AppShell";
import { requireAccount } from "@/features/app-shell/gate";
import { switcherOptionsFrom } from "@/features/app-shell/reading";
import { listLearningLanguages } from "@/lib/db/learning-languages";
import { noIndexPageMetadata } from "@/lib/site-metadata";

import AppLoading from "./loading";

export const metadata: Metadata = noIndexPageMetadata();

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
  // Start the language query before the gate finishes — both only read the
  // session cookie (middleware already validated it), so this overlaps the
  // shell's DB round trip with nothing else on the critical path.
  const learningPromise = listLearningLanguages();
  await requireAccount();
  const outcome = await learningPromise;
  const languages = switcherOptionsFrom(outcome);

  return (
    <AppShell languages={languages}>
      <Suspense fallback={<AppLoading />}>{children}</Suspense>
    </AppShell>
  );
}
