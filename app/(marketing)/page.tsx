import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingHero } from "@/features/marketing/LandingHero";
import { routes } from "@/lib/routes";
import { absoluteUrl, indexablePageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing");
  return indexablePageMetadata({
    title: t("landing.eyebrow"),
    description: `${t("landing.headline")} ${t("landing.subhead")}`,
    openGraph: {
      title: t("landing.headline"),
      description: t("landing.subhead"),
      url: absoluteUrl(routes.landing),
    },
  });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (code) {
    redirect(`${routes.authCallback}?code=${encodeURIComponent(code)}`);
  }

  return <LandingHero />;
}
