/**
 * Contract: docs/specs/service/content-adaptation.md
 */
import { describe, expect, it } from "vitest";

import {
  deliveryGateForCoverage,
  PERSONAL_COMFORT_MIN,
  PERSONAL_T1_MIN,
  startEnabledForGate,
} from "@/lib/adaptation-delivery";

describe("adaptation-delivery", () => {
  it("maps personal coverage to delivery gates", () => {
    expect(deliveryGateForCoverage(PERSONAL_COMFORT_MIN)).toBe("comfortable");
    expect(deliveryGateForCoverage(97)).toBe("comfortable");
    expect(deliveryGateForCoverage(PERSONAL_T1_MIN)).toBe("t1-support");
    expect(deliveryGateForCoverage(94.9)).toBe("t1-support");
    expect(deliveryGateForCoverage(79.9)).toBe("blocked");
  });

  it("blocks Start only under the personal minimum", () => {
    expect(startEnabledForGate("comfortable")).toBe(true);
    expect(startEnabledForGate("t1-support")).toBe(true);
    expect(startEnabledForGate("blocked")).toBe(false);
  });
});
