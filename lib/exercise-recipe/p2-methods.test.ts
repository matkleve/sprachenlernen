import { describe, expect, it } from "vitest";

import { resolveBuildASentenceRecipe } from "@/lib/exercise-recipe/build-a-sentence";
import { resolveListeningLevel1Recipe } from "@/lib/exercise-recipe/listening-level-1";

describe("P2 and listening recipes", () => {
  it("build-a-sentence uses type-with-word and reveal-answer", () => {
    const recipe = resolveBuildASentenceRecipe({ methodId: "build-a-sentence" });
    const components = recipe.steps.map((s) => s.component);
    expect(components).toContain("type-with-word");
    expect(components).toContain("reveal-answer");
  });

  it("listening-level-1 uses audio-play", async () => {
    const recipe = await resolveListeningLevel1Recipe({ methodId: "listening-level-1" });
    expect(recipe).not.toBeNull();
    expect(recipe!.steps.some((s) => s.component === "audio-play")).toBe(true);
  });
});
