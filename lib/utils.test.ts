import { describe, expect, it } from "vitest";

import { safeDecodeURIComponent } from "@/lib/utils";

describe("safeDecodeURIComponent", () => {
  it("decodes a normally encoded value", () => {
    expect(safeDecodeURIComponent("Password%20too%20short")).toBe("Password too short");
  });

  it("returns undefined for undefined, rather than the string 'undefined'", () => {
    expect(safeDecodeURIComponent(undefined)).toBeUndefined();
  });

  it("returns undefined for malformed percent-encoding instead of throwing", () => {
    expect(safeDecodeURIComponent("%")).toBeUndefined();
  });
});
