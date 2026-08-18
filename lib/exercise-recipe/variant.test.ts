/**
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
import { describe, expect, it } from "vitest";

import { variantIdForMaterialSetup } from "@/lib/exercise-recipe/variant";

describe("variantIdForMaterialSetup", () => {
  it("maps partial-dictation units to recipe variants", () => {
    expect(variantIdForMaterialSetup("partial-dictation", "sentence")).toBe("short");
    expect(variantIdForMaterialSetup("partial-dictation", "paragraph")).toBe("standard");
    expect(variantIdForMaterialSetup("partial-dictation", "window")).toBe("long");
  });

  it("maps full-dictation units the same way", () => {
    expect(variantIdForMaterialSetup("full-dictation", "sentence")).toBe("short");
    expect(variantIdForMaterialSetup("full-dictation", "paragraph")).toBe("standard");
    expect(variantIdForMaterialSetup("full-dictation", "window")).toBe("long");
  });

  it("returns undefined for methods without variant mapping", () => {
    expect(variantIdForMaterialSetup("extensive-reading", "sentence")).toBeUndefined();
  });
});
