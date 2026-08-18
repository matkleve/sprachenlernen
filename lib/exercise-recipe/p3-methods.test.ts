import { describe, expect, it } from "vitest";

import { resolveDictoglossRecipe } from "@/lib/exercise-recipe/dictogloss";
import { resolveFourThreeTwoRecipe } from "@/lib/exercise-recipe/four-three-two";
import { resolveDiaryThreeSentencesRecipe } from "@/lib/exercise-recipe/diary-three-sentences";

describe("P3 recipes", () => {
  it("dictogloss includes audio-play and diff-highlight", async () => {
    const recipe = await resolveDictoglossRecipe({ methodId: "dictogloss" });
    expect(recipe).not.toBeNull();
    const components = recipe!.steps.map((s) => s.component);
    expect(components).toContain("audio-play");
    expect(components).toContain("type-freely");
    expect(components).toContain("diff-highlight");
  });

  it("four-three-two includes round-marker and rubric", () => {
    const recipe = resolveFourThreeTwoRecipe({ methodId: "four-three-two" });
    const components = recipe.steps.map((s) => s.component);
    expect(components).toContain("round-marker");
    expect(components).toContain("voice-submit");
    expect(components).toContain("rubric");
  });

  it("diary-three-sentences uses timed-write and feedback", () => {
    const recipe = resolveDiaryThreeSentencesRecipe({ methodId: "diary-three-sentences" });
    const components = recipe.steps.map((s) => s.component);
    expect(components).toContain("timed-write");
    expect(components).toContain("feedback");
  });
});
