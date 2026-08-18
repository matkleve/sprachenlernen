import { describe, expect, it } from "vitest";

import {
  bodyZoneScrolls,
  exerciseStepContentProfile,
} from "@/lib/exercise-runner/content-profile";

describe("exerciseStepContentProfile", () => {
  it("marks prepare checklist as short", () => {
    expect(
      exerciseStepContentProfile({
        id: "p",
        type: "prepare",
        component: "checklist",
        config: {},
      }),
    ).toBe("short");
  });

  it("marks text-display as paginated", () => {
    expect(
      exerciseStepContentProfile({
        id: "r",
        type: "do",
        component: "text-display",
        config: {},
      }),
    ).toBe("paginated");
  });

  it("scroll profile enables body scroll zone", () => {
    expect(bodyZoneScrolls("short")).toBe(false);
    expect(bodyZoneScrolls("scroll")).toBe(true);
    expect(bodyZoneScrolls("paginated")).toBe(true);
  });
});
