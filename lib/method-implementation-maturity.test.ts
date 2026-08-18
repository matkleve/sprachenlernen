/**
 * Contract: docs/specs/service/method-implementation-maturity.md
 */
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { implementationMaturityTier } from "@/lib/method-implementation-maturity";

describe("implementationMaturityTier", () => {
  it("AC: srs-session is I4", () => {
    const { catalogue } = loadMethodCatalogue();
    const srs = catalogue!.entries.find((e) => e.id === "srs-session")!;
    expect(implementationMaturityTier(srs)).toBe("I4");
  });

  it("AC: extensive-reading is I3", () => {
    const { catalogue } = loadMethodCatalogue();
    const er = catalogue!.entries.find((e) => e.id === "extensive-reading")!;
    expect(implementationMaturityTier(er)).toBe("I3");
  });

  it("AC: built exercise methods are at least I2", () => {
    const { catalogue } = loadMethodCatalogue();
    for (const id of ["partial-dictation", "reading-aloud"]) {
      const entry = catalogue!.entries.find((e) => e.id === id)!;
      expect(implementationMaturityTier(entry)).toBe("I3");
    }
  });

  it("AC: built guided methods are I2", () => {
    const { catalogue } = loadMethodCatalogue();
    const rolePlay = catalogue!.entries.find((e) => e.id === "role-play")!;
    expect(implementationMaturityTier(rolePlay)).toBe("I2");
  });

  it("AC: missing recipe is I0", () => {
    expect(
      implementationMaturityTier(
        { id: "fake-method", materialTopics: [], targetSignal: null },
        { recipeSpecced: false },
      ),
    ).toBe("I0");
  });
});
