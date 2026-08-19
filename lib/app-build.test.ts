import { describe, expect, it } from "vitest";

import { parseAppBuiltAt } from "@/lib/app-build";

describe("app-build", () => {
  it("parses a valid ISO timestamp", () => {
    const raw = "2026-08-19T18:42:00.000Z";
    expect(parseAppBuiltAt(raw)).toBe(Date.parse(raw));
  });

  it("returns null for missing or invalid values", () => {
    expect(parseAppBuiltAt(null)).toBeNull();
    expect(parseAppBuiltAt(undefined)).toBeNull();
    expect(parseAppBuiltAt("not-a-date")).toBeNull();
  });
});
