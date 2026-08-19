/** Contract: docs/specs/service/exercise-recipe-composer.md */
import type { MaterialUnitId } from "@/lib/material-unit";
import type { ExerciseRecipe } from "@/lib/exercise-runner/types";

export const RECIPE_VARIANT_IDS = ["short", "standard", "long"] as const;

export type RecipeVariantId = (typeof RECIPE_VARIANT_IDS)[number];

export type SessionContext = {
  methodId: string;
  sourceId?: string | null;
  topicId?: string | null;
  unitId?: MaterialUnitId;
  durationSec?: number;
  /** Snapped menu or detail variant — drives compose volume (T-MV5). */
  budgetMinutes?: number;
  variantId?: RecipeVariantId;
  heldLemmas?: ReadonlySet<string>;
};

export type RecipeComposer = (
  ctx: SessionContext,
) => ExerciseRecipe | null | Promise<ExerciseRecipe | null>;

export type ResolveRecipeOptions = {
  sourceId?: string | null;
  topicId?: string | null;
  unitId?: MaterialUnitId;
  durationSec?: number;
  budgetMinutes?: number;
  variantId?: RecipeVariantId;
  heldLemmas?: ReadonlySet<string>;
};
