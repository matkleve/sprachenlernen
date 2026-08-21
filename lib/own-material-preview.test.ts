/**
 * Contract: docs/specs/feature/method-material-setup.md
 */
import { describe, expect, it } from "vitest";

import type { MaterialSetupPreview } from "@/lib/method-material-setup";
import { ownMaterialFeelForPreview } from "@/lib/own-material-preview";

const basePreview = (overrides: Partial<MaterialSetupPreview>): MaterialSetupPreview => ({
  sourceId: "learner-1",
  title: "Your text",
  coverage: {
    coveragePercent: 50,
    tokenCount: 10,
    knownCount: 5,
    comfortBand: "demanding",
  },
  unitId: "full",
  unitLabel: "Full text",
  timeLabel: "~1 min",
  ...overrides,
});

describe("ownMaterialFeelForPreview", () => {
  it("maps delivery gate and errors to plain feel words", () => {
    expect(
      ownMaterialFeelForPreview(
        basePreview({ coverage: { ...basePreview({}).coverage, comfortBand: "comfortable" } }),
      ),
    ).toBe("comfortable");
    expect(
      ownMaterialFeelForPreview(basePreview({ deliveryGate: "t1-support" })),
    ).toBe("demanding");
    expect(
      ownMaterialFeelForPreview(basePreview({ deliveryGate: "blocked" })),
    ).toBe("veryHard");
    expect(
      ownMaterialFeelForPreview(basePreview({ adaptationError: "failed" })),
    ).toBe("veryHard");
  });
});
