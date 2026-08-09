import type { Metadata } from "next";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod, MethodDetail } from "@/features/method-menu/MethodDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, id);
  return { title: method?.name ?? "Method" };
}

export default async function MethodDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { catalogue } = loadMethodCatalogue();
  const method = findMethod(catalogue, id);

  return <MethodDetail method={method} searchParams={query} />;
}
