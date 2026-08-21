/**
 * Plain-language coverage line for learner own-text preview.
 * Contract: docs/specs/feature/method-material-setup.md
 */
import type { MaterialSetupPreview } from "@/lib/method-material-setup";

export const OWN_MATERIAL_FEELS = ["comfortable", "demanding", "hard", "veryHard"] as const;
export type OwnMaterialFeel = (typeof OWN_MATERIAL_FEELS)[number];

export function ownMaterialFeelForPreview(preview: MaterialSetupPreview): OwnMaterialFeel {
  if (preview.adaptationError) return "veryHard";
  if (preview.deliveryGate === "blocked") return "veryHard";
  if (preview.deliveryGate === "t1-support") return "demanding";
  if (preview.coverage.comfortBand === "comfortable") return "comfortable";
  return "demanding";
}
