/**
 * Maps material setup unit ids to recipe variants. Contract:
 * docs/specs/service/exercise-recipe-composer.md
 */
import type { MaterialUnitId } from "@/lib/material-unit";

import type { RecipeVariantId } from "./types";

/** Partial and full dictation: sentence → short, paragraph → standard, window → long. */
export function variantIdForMaterialSetup(
  methodId: string,
  unitId: MaterialUnitId,
): RecipeVariantId | undefined {
  if (methodId !== "partial-dictation" && methodId !== "full-dictation") return undefined;
  if (unitId === "window") return "long";
  if (unitId === "paragraph") return "standard";
  return "short";
}
