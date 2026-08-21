/**
 * Contract: docs/specs/service/content-adaptation.md
 */
import { describe, expect, it } from "vitest";

import {
  adaptationLabelForLevel,
  buildAdaptationCacheKey,
  meetsAdaptationCoverage,
} from "@/lib/content-adaptation";

describe("content-adaptation", () => {
  it("builds a stable cache key for catalogue adaptations", () => {
    const key = buildAdaptationCacheKey({
      sourceId: "wikinews-es-3516",
      languageCode: "es",
      targetLevel: "A2",
      tier: "T2",
      promptVersion: "v1",
    });

    expect(key).toBe("wikinews-es-3516:es:A2:T2:v1");
  });

  it("labels adapted copy honestly", () => {
    expect(adaptationLabelForLevel("A2")).toBe(
      "Adapted for A2 · not the original article",
    );
  });

  it("requires comfortable coverage on adapted output", () => {
    expect(meetsAdaptationCoverage(95)).toBe(true);
    expect(meetsAdaptationCoverage(94.9)).toBe(false);
  });
});
