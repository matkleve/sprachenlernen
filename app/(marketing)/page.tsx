import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { LandingHero } from "@/features/marketing/LandingHero";
import { copy } from "@/features/marketing/content";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";
import { absoluteUrl, indexablePageMetadata } from "@/lib/site-metadata";

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

export const metadata: Metadata = indexablePageMetadata({
  title: copy.landing.eyebrow,
  description: `${copy.landing.headline} ${copy.landing.subhead}`,
  openGraph: {
    title: copy.landing.headline,
    description: copy.landing.subhead,
    url: absoluteUrl(routes.landing),
  },
});

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
