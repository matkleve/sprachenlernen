import { describe, expect, it } from "vitest";

import { paradigmCellGroupKey, paradigmCellGroupLabel } from "@/lib/form-cell-groups";

describe("form-cell-groups", () => {
  it("collapses person variants within a tense", () => {
    expect(paradigmCellGroupKey("ind.pres.1sg")).toBe("verb:present");
    expect(paradigmCellGroupKey("ind.pres.3pl")).toBe("verb:present");
    expect(paradigmCellGroupLabel("ind.pres.3sg")).toBe("present");
  });

  it("groups nominal cells by their shape label", () => {
    expect(paradigmCellGroupKey("pl")).toBe("nominal:plural");
    expect(paradigmCellGroupKey("f.sg")).toBe("nominal:feminine singular");
  });
});
