import { redirect } from "next/navigation";

import { LandingHero } from "@/features/marketing/LandingHero";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

/**
 * The public landing page. Contract: docs/specs/page/landing.md
 *
 * Signed-in visitors belong in the app, not on the persuasion surface — same
 * rule as `/login` and `/signup` in docs/specs/service/auth.md.
 *
 * Supabase sometimes lands email confirmation on `/?code=…` (site URL only)
 * instead of `/auth/callback?code=…`. Forwarding here avoids a dead end when
 * the redirect_to in the mail omitted the callback path.
 */
// Branches on sign-in state, so it cannot be prerendered — same reason and
// the same failure mode as app/(app)/layout.tsx, which carries the full note.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (code) {
    redirect(`${routes.authCallback}?code=${encodeURIComponent(code)}`);
  }

  const account = await getAccount();
  if (account) redirect(routes.appHome);

  return <LandingHero />;
}
