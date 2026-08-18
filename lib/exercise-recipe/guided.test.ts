import { describe, expect, it } from "vitest";

import { GUIDED_METHOD_IDS } from "@/lib/exercise-recipe/guided-ids";
import { resolveGuidedRecipe } from "@/lib/exercise-recipe/guided";

describe("guided recipes", () => {
  it("every guided id resolves a recipe with confirm-done", () => {
    for (const methodId of GUIDED_METHOD_IDS) {
      const recipe = resolveGuidedRecipe({ methodId });
      expect(recipe, methodId).not.toBeNull();
      const components = recipe!.steps.map((s) => s.component ?? s.type);
      expect(components, methodId).toContain("confirm-done");
    }
  });

  it("role-play includes sheet-download and debrief-prompt", () => {
    const recipe = resolveGuidedRecipe({ methodId: "role-play" });
    const components = recipe!.steps.map((s) => s.component ?? s.type);
    expect(components).toContain("sheet-download");
    expect(components).toContain("debrief-prompt");
  });

  it("tandem wait uses catalogue duration in seconds", () => {
    const recipe = resolveGuidedRecipe({ methodId: "tandem-or-language-cafe" });
    const wait = recipe!.steps.find((s) => s.type === "wait");
    expect(wait?.config.durationSec).toBe(45 * 60);
  });
});
