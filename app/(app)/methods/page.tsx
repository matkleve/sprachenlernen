import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { loadMethodsDestination } from "@/features/method-menu/loadMethodsDestination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("methodMenu");
  return { title: t("title") };
}

export default async function MethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await loadMethodsDestination(searchParams);

  return <MethodMenu {...data} />;
}
