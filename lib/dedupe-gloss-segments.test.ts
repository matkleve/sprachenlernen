import { describe, expect, it } from "vitest";

import { dedupeGlossSegments } from "@/lib/dedupe-gloss-segments";

describe("dedupeGlossSegments", () => {
  it("removes repeated comma-separated segments case-insensitively", () => {
    expect(
      dedupeGlossSegments("sich selbst, sich selbst, sich selbst, sich selbst"),
    ).toBe("sich selbst");
  });

  it("keeps distinct segments in order", () => {
    expect(dedupeGlossSegments("oneself, himself, herself, itself, themselves")).toBe(
      "oneself, himself, herself, itself, themselves",
    );
  });

  it("preserves the first segment's casing", () => {
    expect(dedupeGlossSegments("Ja, ja, JA")).toBe("Ja");
  });

  it("leaves glosses without commas unchanged", () => {
    expect(dedupeGlossSegments("tun")).toBe("tun");
  });

  it("does not split on semicolons", () => {
    expect(dedupeGlossSegments("safe; secure")).toBe("safe; secure");
  });
});
