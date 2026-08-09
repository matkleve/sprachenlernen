import { redirect } from "next/navigation";

import { LandingHero } from "@/features/marketing/LandingHero";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

/**
 * The public landing page. Contract: docs/specs/page/landing.md
 *
 * Signed-in visitors belong in the app, not on the persuasion surface — same
 * rule as `/login` and `/signup` in docs/specs/service/auth.md.
 */
export default async function Home() {
  const account = await getAccount();
  if (account) redirect(routes.appHome);

  return <LandingHero />;
}
