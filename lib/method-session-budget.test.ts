import { describe, expect, it } from "vitest";

import {
  appendVariantMinutesParam,
  catalogueVariantMinutes,
  resolveDefaultVariantMinutes,
  resolveVariantMinutes,
  showDurationVariantPicker,
} from "@/lib/method-session-budget";

describe("catalogueVariantMinutes", () => {
  it("returns all catalogue packages regardless of menu context", () => {
    expect(catalogueVariantMinutes([8, 15, 20])).toEqual([8, 15, 20]);
    expect(catalogueVariantMinutes(null)).toEqual([]);
    expect(catalogueVariantMinutes([])).toEqual([]);
  });
});

describe("resolveVariantMinutes", () => {
  it("defaults to the longest catalogue package", () => {
    expect(resolveVariantMinutes([8, 15, 20])).toBe(20);
  });

  it("honours selected variant when it is in the catalogue", () => {
    expect(
      resolveVariantMinutes([8, 15, 20], {
        selectedVariantRaw: "8",
      }),
    ).toBe(8);
  });

  it("returns undefined for srs-session and empty catalogues", () => {
    expect(resolveVariantMinutes([10], { methodId: "srs-session" })).toBeUndefined();
    expect(resolveVariantMinutes(null)).toBeUndefined();
    expect(resolveVariantMinutes([])).toBeUndefined();
  });
});

describe("resolveDefaultVariantMinutes", () => {
  it("matches the longest catalogue package", () => {
    expect(resolveDefaultVariantMinutes([8, 15, 20])).toBe(20);
  });
});

describe("showDurationVariantPicker", () => {
  it("is false for srs-session and single-package methods", () => {
    expect(showDurationVariantPicker([10], "srs-session")).toBe(false);
    expect(showDurationVariantPicker([10], "build-a-sentence")).toBe(false);
    expect(showDurationVariantPicker([8, 15], "build-a-sentence")).toBe(true);
  });
});

describe("appendVariantMinutesParam", () => {
  it("adds minutes when variant is defined", () => {
    const params = new URLSearchParams({ method: "partial-dictation" });
    appendVariantMinutesParam(params, 15);
    expect(params.get("minutes")).toBe("15");
  });

  it("leaves params unchanged when variant is undefined", () => {
    const params = new URLSearchParams({ method: "partial-dictation" });
    appendVariantMinutesParam(params, undefined);
    expect(params.has("minutes")).toBe(false);
  });
});
