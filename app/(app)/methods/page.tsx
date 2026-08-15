import type { Metadata } from "next";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { copy } from "@/features/method-menu/content";
import { loadMethodsDestination } from "@/features/method-menu/loadMethodsDestination";

export const metadata: Metadata = {
  title: copy.title,
};

export default async function MethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await loadMethodsDestination(searchParams);

  return <MethodMenu {...data} />;
}
