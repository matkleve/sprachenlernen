/**
 * Contract: docs/specs/service/exercise-step-components.md
 */
import { describe, expect, it } from "vitest";

import {
  isShippedStepComponent,
  isStepComponentRenderable,
  resolveStepComponentId,
} from "@/lib/exercise-step-components";

describe("exercise-step-components registry", () => {
  it("resolves default component per step type", () => {
    expect(resolveStepComponentId({ type: "prepare" })).toBe("checklist");
    expect(resolveStepComponentId({ type: "do", component: "gap-fill" })).toBe("gap-fill");
    expect(resolveStepComponentId({ type: "decide" })).toBe("offers");
  });

  it("marks shipped components as renderable", () => {
    expect(isShippedStepComponent("gap-fill")).toBe(true);
    expect(isShippedStepComponent("type-with-word")).toBe(true);
    expect(isShippedStepComponent("reveal-answer")).toBe(true);
    expect(isShippedStepComponent("audio-play")).toBe(false);
  });

  it("renders not-built for unknown do components", () => {
    expect(
      isStepComponentRenderable({ type: "do", component: "audio-play" }),
    ).toBe(false);
  });

  it("always renders wait steps without a component id", () => {
    expect(isStepComponentRenderable({ type: "wait" })).toBe(true);
  });
});
