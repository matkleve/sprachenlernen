import { redirect } from "next/navigation";

import { authContent } from "@/features/auth/content";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { getAccount } from "@/lib/db/auth";

/**
 * A page composes and passes data down — no logic here that a test can't
 * reach without a router (docs/ARCHITECTURE.md). Contract:
 * docs/specs/service/auth.md.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const account = await getAccount();
  if (account) redirect("/");

  const { error, sent } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {authContent.signUp.heading}
      </h1>
      <SignUpForm error={error ? decodeURIComponent(error) : undefined} sent={sent === "1"} />
    </div>
  );
}
