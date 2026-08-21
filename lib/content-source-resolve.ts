import { cookies } from "next/headers";

import { loadPersistedAdaptationCache, loadPersonalAdaptationCache } from "@/lib/adaptation-cache";
import { sourceWithShownBody } from "@/lib/adaptation-preview";
import {
  DEFAULT_T2_PROMPT_VERSION,
  readCachedAdaptationBody,
} from "@/lib/catalogue-adaptation";
import { findContentSourceById } from "@/lib/content-sources";
import type { Source } from "@/lib/coverage";
import { findLearnerSourceById } from "@/lib/db/content-sources";
import {
  EPHEMERAL_SOURCE_COOKIE,
  parseEphemeralSourceCookie,
} from "@/lib/ephemeral-source-cookie";
import { readCachedLearnerAdaptationBody } from "@/lib/learner-adaptation";
import { inferTargetLevelFromHeldCount } from "@/lib/target-level";

export type ResolveContentSourceOptions = {
  adapted?: boolean;
  targetLevel?: string;
  heldLemmaCount?: number;
  heldLemmas?: ReadonlySet<string>;
};

/**
 * Resolve a Source for server routes — catalogue JSON, saved learner row, or
 * ephemeral session cookie. Contract: docs/specs/feature/word-capture.md
 */
export async function resolveContentSourceById(
  sourceId: string,
  options: ResolveContentSourceOptions = {},
): Promise<Source | null> {
  const catalogue = findContentSourceById(sourceId);
  let source = catalogue;

  if (!source) {
    const cookieStore = await cookies();
    const ephemeral = parseEphemeralSourceCookie(cookieStore.get(EPHEMERAL_SOURCE_COOKIE)?.value);
    if (ephemeral?.id === sourceId) source = ephemeral;
  }

  if (!source) {
    const learner = await findLearnerSourceById(sourceId);
    if (learner.status === "ok") source = learner.source;
  }

  if (!source || !options.adapted) return source;

  if (source.origin === "catalogue") {
    const targetLevel =
      options.targetLevel ?? inferTargetLevelFromHeldCount(options.heldLemmaCount ?? 0);
    const cache = loadPersistedAdaptationCache();
    const cachedBody = readCachedAdaptationBody(cache, {
      sourceId: source.id,
      languageCode: source.languageCode,
      targetLevel,
      tier: "T2",
      promptVersion: DEFAULT_T2_PROMPT_VERSION,
    });

    if (!cachedBody) return source;
    return sourceWithShownBody(source, cachedBody);
  }

  if (source.origin === "learner" && options.heldLemmas) {
    const targetLevel =
      options.targetLevel ??
      inferTargetLevelFromHeldCount(options.heldLemmaCount ?? options.heldLemmas.size);
    const cache = loadPersonalAdaptationCache();
    const cachedBody = readCachedLearnerAdaptationBody(cache, {
      originalBody: source.body ?? "",
      languageCode: source.languageCode,
      targetLevel,
      heldLemmas: options.heldLemmas,
    });
    if (!cachedBody) return source;
    return sourceWithShownBody(source, cachedBody);
  }

  return source;
}
