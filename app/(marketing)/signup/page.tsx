import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { authContent } from "@/features/auth/content";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";
import { noIndexPageMetadata } from "@/lib/site-metadata";
import { safeDecodeURIComponent } from "@/lib/utils";

/**
 * A page composes and passes data down — no logic here that a test can't
 * reach without a router (docs/ARCHITECTURE.md). Contract:
 * docs/specs/service/auth.md.
 */
// Branches on sign-in state, so it cannot be prerendered — same reason and
// the same failure mode as app/(app)/layout.tsx, which carries the full note.
export const dynamic = "force-dynamic";

export const metadata: Metadata = noIndexPageMetadata({
  title: authContent.signUp.heading,
});

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; ref?: string }>;
}) {
  const account = await getAccount();
  if (account) redirect(routes.appHome);

  const { error, sent, ref } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {authContent.signUp.heading}
      </h1>
      <SignUpForm
        error={safeDecodeURIComponent(error)}
        referenceId={ref}
        sent={sent === "1"}
      />
    </div>
  );
}
