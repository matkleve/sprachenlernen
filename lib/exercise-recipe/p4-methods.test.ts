import { describe, expect, it } from "vitest";

import { resolveIntensiveReadingRecipe } from "@/lib/exercise-recipe/intensive-reading";
import { resolveNarrowReadingRecipe } from "@/lib/exercise-recipe/narrow-reading";
import { resolveReciteMemorisedRecipe } from "@/lib/exercise-recipe/recite-memorised";
import { resolveRetellWhatYouReadRecipe } from "@/lib/exercise-recipe/retell-what-you-read";
import { resolveRuleAtPointOfErrorRecipe } from "@/lib/exercise-recipe/rule-at-point-of-error";
import { resolveSummariseWhatYouReadRecipe } from "@/lib/exercise-recipe/summarise-what-you-read";

describe("P4 recipes", () => {
  it("narrow-reading includes four text-display steps", async () => {
    const recipe = await resolveNarrowReadingRecipe({ methodId: "narrow-reading" });
    expect(recipe).not.toBeNull();
    const textSteps = recipe!.steps.filter((step) => step.component === "text-display");
    expect(textSteps).toHaveLength(4);
  });

  it("intensive-reading uses reveal-answer and prompt", async () => {
    const recipe = await resolveIntensiveReadingRecipe({ methodId: "intensive-reading" });
    const components = recipe!.steps.map((step) => step.component);
    expect(components).toContain("reveal-answer");
    expect(components).toContain("prompt");
    expect(components).toContain("offers");
  });

  it("retell-what-you-read uses voice-submit and rubric", async () => {
    const recipe = await resolveRetellWhatYouReadRecipe({ methodId: "retell-what-you-read" });
    const components = recipe!.steps.map((step) => step.component);
    expect(components).toContain("voice-submit");
    expect(components).toContain("rubric");
  });

  it("recite-memorised ends with summary", async () => {
    const recipe = await resolveReciteMemorisedRecipe({ methodId: "recite-memorised" });
    expect(recipe!.steps.at(-1)?.component).toBe("summary");
  });

  it("summarise-what-you-read uses timed-write and feedback", async () => {
    const recipe = await resolveSummariseWhatYouReadRecipe({ methodId: "summarise-what-you-read" });
    const components = recipe!.steps.map((step) => step.component);
    expect(components).toContain("timed-write");
    expect(components).toContain("feedback");
  });

  it("rule-at-point-of-error is a short prompt session", () => {
    const recipe = resolveRuleAtPointOfErrorRecipe({ methodId: "rule-at-point-of-error" });
    expect(recipe.steps).toHaveLength(2);
    expect(recipe.steps[0]?.component).toBe("prompt");
  });
});
