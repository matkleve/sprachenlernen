/**
 * Implementation maturity tiers — contract:
 * docs/specs/service/method-implementation-maturity.md
 */
import { hasExerciseRecipe } from "@/lib/exercise-recipe-built";

export type ImplementationMaturityTier = "I0" | "I1" | "I2" | "I3" | "I4";

const BUILT_CARD_I4 = new Set(["srs-session"]);

const ADAPTIVE_COMPOSE_IDS = new Set([
  "partial-dictation",
  "full-dictation",
  "extensive-reading",
  "reading-aloud",
]);

export type MaturityCatalogueEntry = {
  id: string;
  materialTopics?: readonly { id: string }[];
  targetSignal?: string | null;
};

export function implementationMaturityTier(
  entry: MaturityCatalogueEntry,
  options: { recipeSpecced?: boolean } = {},
): ImplementationMaturityTier {
  const recipeSpecced = options.recipeSpecced ?? true;

  if (!recipeSpecced) return "I0";
  if (!hasExerciseRecipe(entry.id) && !BUILT_CARD_I4.has(entry.id)) return "I1";

  if (BUILT_CARD_I4.has(entry.id) && entry.targetSignal) return "I4";

  const adaptive =
    ADAPTIVE_COMPOSE_IDS.has(entry.id) || (entry.materialTopics?.length ?? 0) > 0;
  if (adaptive) return "I3";

  return "I2";
}
