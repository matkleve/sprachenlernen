import { redirect } from "next/navigation";

import { authContent } from "@/features/auth/content";
import { SignInForm } from "@/features/auth/SignInForm";
import { getAccount } from "@/lib/db/auth";

/**
 * A page composes and passes data down — no logic here that a test can't
 * reach without a router (docs/ARCHITECTURE.md). Contract:
 * docs/specs/service/auth.md.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const account = await getAccount();
  if (account) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {authContent.signIn.heading}
      </h1>
      <SignInForm error={error ? decodeURIComponent(error) : undefined} />
    </div>
  );
}
