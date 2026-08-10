import type { Metadata } from "next";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { copy } from "@/features/method-menu/content";
import { catalogueLoadFailed, logHandledError, toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: copy.title,
};

export default async function MethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { catalogue, presets, errors } = loadMethodCatalogue();
  let loadError;
  if (errors.length > 0) {
    const handled = catalogueLoadFailed(errors);
    logHandledError(handled);
    loadError = toUserFacing(handled);
  }

  return (
    <MethodMenu
      catalogue={catalogue}
      presets={presets}
      loadError={loadError}
      initialSearchParams={params}
    />
  );
}
