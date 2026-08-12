import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MethodMenu } from "@/features/method-menu/MethodMenu";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { copy } from "@/features/method-menu/content";
import { readStanding } from "@/features/method-menu/readStanding";
import { catalogueLoadFailed, logHandledError, toUserFacing } from "@/lib/errors";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: copy.title,
};

export default async function MethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ catalogue, presets, errors }, standing] = await Promise.all([
    Promise.resolve(loadMethodCatalogue()),
    readStanding(),
  ]);
  // The guard belongs on the destination, not on signup: there are four ways
  // into the app — immediate-session signup, the confirmation link, OAuth, and
  // simply signing in later — and only the first passed through the picker.
  // Guarding the entrance meant three of them never asked.
  if (standing.status === "no-language") redirect(routes.chooseLanguage);

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
      standing={standing.status === "ok" ? standing.summary : undefined}
      dayKey={new Date().toISOString().slice(0, 10)}
    />
  );
}
