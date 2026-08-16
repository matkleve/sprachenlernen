import { redirect } from "next/navigation";

import { catalogueLoadFailed, logHandledError, toUserFacing } from "@/lib/errors";
import type { UserFacingError } from "@/lib/errors";
import type { DemonstrationSentencePick } from "@/lib/demonstration-sentence";
import { readDemonstrationSentence } from "@/lib/demonstration-sentence";
import type { Catalogue, Preset } from "@/lib/method-catalogue";
import { routes } from "@/lib/routes";

import { loadMethodCatalogue } from "./catalogue";
import type { StandingSummary } from "./standing";
import { readStanding } from "./readStanding";

export type MethodsDestinationData = {
  catalogue?: Catalogue;
  presets?: Preset[];
  loadError?: UserFacingError;
  initialSearchParams: Record<string, string | string[] | undefined>;
  standing?: StandingSummary;
  demonstration?: DemonstrationSentencePick;
  dayKey: string;
};

/**
 * Shared server loader for `/methods`.
 */
export async function loadMethodsDestination(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<MethodsDestinationData> {
  const params = await searchParams;
  const dayKey = new Date().toISOString().slice(0, 10);
  const [{ catalogue, presets, errors }, standing, demonstration] = await Promise.all([
    Promise.resolve(loadMethodCatalogue()),
    readStanding(),
    readDemonstrationSentence(dayKey),
  ]);

  if (standing.status === "no-language") redirect(routes.chooseLanguage);

  let loadError;
  if (errors.length > 0) {
    const handled = catalogueLoadFailed(errors);
    logHandledError(handled);
    loadError = toUserFacing(handled);
  }

  return {
    catalogue,
    presets,
    loadError,
    initialSearchParams: params,
    standing: standing.status === "ok" ? standing.summary : undefined,
    demonstration:
      demonstration.status === "ok" ? demonstration.pick : undefined,
    dayKey,
  };
}
