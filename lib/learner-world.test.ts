import { describe, expect, it } from "vitest";

import {
  DEFAULT_LEARNER_WORLD_CONFIG,
  isLearnerWorldId,
  worldMatchFactor,
} from "@/lib/learner-world";

describe("learner-world", () => {
  it("defaults general to neutral worldMatch", () => {
    expect(worldMatchFactor(["politics"], "general")).toBe(1);
  });

  it("boosts matching lemma world tags", () => {
    expect(worldMatchFactor(["politics"], "politics")).toBe(
      DEFAULT_LEARNER_WORLD_CONFIG.gammaMatch,
    );
  });

  it("leaves non-matching tags at baseline weight", () => {
    expect(worldMatchFactor(["business"], "politics")).toBe(1);
  });

  it("matches when lemma tags multiple worlds", () => {
    expect(worldMatchFactor(["business", "politics"], "politics")).toBe(
      DEFAULT_LEARNER_WORLD_CONFIG.gammaMatch,
    );
  });

  it("validates world ids", () => {
    expect(isLearnerWorldId("politics")).toBe(true);
    expect(isLearnerWorldId("news")).toBe(false);
  });
});
