import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SignUpForm } from "@/features/auth/SignUpForm";
import { getAccount } from "@/lib/db/auth";
import { routes } from "@/lib/routes";
import { noIndexPageMetadata } from "@/lib/site-metadata";
import { parseAuthErrorCode } from "@/lib/auth-error-code";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return noIndexPageMetadata({ title: t("signUp.heading") });
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; resent?: string; ref?: string; email?: string }>;
}) {
  const t = await getTranslations("auth");
  const account = await getAccount();
  if (account) redirect(routes.appHome);

  const { error, sent, resent, ref, email } = await searchParams;
  const errorCode = parseAuthErrorCode(error);

  return (
    <div className="mx-auto max-w-sm px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("signUp.heading")}</h1>
      <SignUpForm
        error={errorCode ? t(`errors.${errorCode}`) : undefined}
        referenceId={errorCode ? ref : undefined}
        sent={sent === "1"}
        resent={resent === "1"}
        email={email}
      />
    </div>
  );
}
