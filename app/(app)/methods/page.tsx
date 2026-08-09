import type { Metadata } from "next";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { copy } from "@/features/method-menu/content";
import { catalogueLoadFailed, logHandledError, toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: copy.title,
};

/**
 * The app's default route (ADR-0010). A page composes a feature and hands it
 * data; the reading lives in the feature so a test can reach it without a
 * router.
 *
 * The chosen context is a search parameter rather than component state — that
 * is what keeps this a Server Component, makes a situation shareable as a
 * link, and survives a reload. See docs/specs/page/method-menu.md § States.
 */
export default async function MethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string }>;
}) {
  const { context } = await searchParams;
  const { catalogue, presets, errors } = loadMethodCatalogue();
  let loadError;
  if (errors.length > 0) {
    const handled = catalogueLoadFailed(errors);
    logHandledError(handled);
    loadError = toUserFacing(handled);
  }

  return (
    <MethodMenu catalogue={catalogue} presets={presets} loadError={loadError} context={context} />
  );
}
