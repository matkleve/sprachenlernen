import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadLemmaTable } from "@/lib/lemma-table";
import {
  buildInverseFormIndex,
  buildLemmaGenderMap,
} from "@/lib/sentence-realizer/inverse-index";
import type { RealizerContext, SentencePlan, SentencePlanBank } from "@/lib/sentence-realizer/types";

const planCache = new Map<string, SentencePlan[]>();
const contextCache = new Map<string, RealizerContext>();

function readLemmaTable(languageCode: string) {
  const path = join(process.cwd(), "data/lemma", `${languageCode}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const result = loadLemmaTable(raw, languageCode);
  if (!result.table) {
    throw new Error(
      `sentence-realizer: could not load lemma table for ${languageCode}: ${result.errors.join("; ")}`,
    );
  }
  return result.table;
}

export function loadSentencePlans(languageCode: "es"): SentencePlan[] {
  const cached = planCache.get(languageCode);
  if (cached) return cached;

  const path = join(process.cwd(), "data/sentence-plans", `${languageCode}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8")) as SentencePlanBank;
  if (!Array.isArray(raw.plans) || raw.plans.length === 0) {
    throw new Error(`sentence-realizer: no plans in ${path}`);
  }
  planCache.set(languageCode, raw.plans);
  return raw.plans;
}

export function loadSpanishRealizerContext(): RealizerContext {
  const cached = contextCache.get("es");
  if (cached) return cached;

  const table = readLemmaTable("es");
  const ctx: RealizerContext = {
    index: buildInverseFormIndex(table),
    lemmaGender: buildLemmaGenderMap(table),
  };
  contextCache.set("es", ctx);
  return ctx;
}

export function pickShuffledPlan(plans: readonly SentencePlan[], seed: number): SentencePlan {
  const index = ((seed % plans.length) + plans.length) % plans.length;
  return plans[index]!;
}
