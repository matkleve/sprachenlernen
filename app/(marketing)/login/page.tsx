import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SignInForm } from "@/features/auth/SignInForm";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";
import { noIndexPageMetadata } from "@/lib/site-metadata";
import { parseAuthErrorCode } from "@/lib/auth-error-code";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return noIndexPageMetadata({ title: t("signIn.heading") });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const t = await getTranslations("auth");
  const account = await getAccount();
  if (account) redirect(routes.appHome);

  const { error, ref } = await searchParams;
  // The URL names a code; the copy comes from messages/*.json. Anything else
  // in `error` renders nothing at all — see lib/auth-error-code.ts.
  const errorCode = parseAuthErrorCode(error);

  return (
    <div className="mx-auto max-w-sm px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("signIn.heading")}</h1>
      <SignInForm
        error={errorCode ? t(`errors.${errorCode}`) : undefined}
        referenceId={errorCode ? ref : undefined}
      />
    </div>
  );
}
