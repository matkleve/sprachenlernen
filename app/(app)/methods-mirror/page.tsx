import type { Metadata } from "next";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { MethodsMirrorBanner } from "@/features/method-menu/MethodsMirrorBanner";
import { copy } from "@/features/method-menu/content";
import { loadMethodsDestination } from "@/features/method-menu/loadMethodsDestination";

export const metadata: Metadata = {
  title: copy.mirrorTitle,
  robots: { index: false, follow: false },
};

/**
 * Byte-for-byte twin of `/methods` for iOS Safari toolbar A/B.
 * Contract: docs/study/29-ios-inset-by-route.md § Methods mirror.
 */
export default async function MethodsMirrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await loadMethodsDestination(searchParams);

  return (
    <>
      <MethodsMirrorBanner />
      <MethodMenu {...data} />
    </>
  );
}
