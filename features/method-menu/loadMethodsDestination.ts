import { redirect } from "next/navigation";

import { catalogueLoadFailed, logHandledError, toUserFacing } from "@/lib/errors";
import type { Catalogue, Preset } from "@/lib/method-catalogue";
import type { UserFacingError } from "@/lib/errors";
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
  dayKey: string;
};

/**
 * Shared server loader for `/methods` and `/methods-mirror` (Safari A/B).
 * Contract: docs/study/29-ios-inset-by-route.md § Methods mirror.
 */
export async function loadMethodsDestination(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<MethodsDestinationData> {
  const params = await searchParams;
  const [{ catalogue, presets, errors }, standing] = await Promise.all([
    Promise.resolve(loadMethodCatalogue()),
    readStanding(),
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
    dayKey: new Date().toISOString().slice(0, 10),
  };
}
