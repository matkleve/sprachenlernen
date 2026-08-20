import { describe, expect, it } from "vitest";

import {
  appendVariantMinutesParam,
  availableVariantMinutes,
  resolveDefaultVariantMinutes,
  resolveVariantMinutes,
  showDurationVariantPicker,
} from "@/lib/method-session-budget";

describe("availableVariantMinutes", () => {
  it("returns all packages when menu filter is missing or endless", () => {
    expect(availableVariantMinutes([8, 15, 20], undefined)).toEqual([8, 15, 20]);
    expect(availableVariantMinutes([8, 15, 20], "endless")).toEqual([8, 15, 20]);
  });

  it("filters packages by menu time filter", () => {
    expect(availableVariantMinutes([8, 15, 20], 15)).toEqual([8, 15]);
    expect(availableVariantMinutes([8, 15, 20], 5)).toEqual([]);
  });
});

describe("resolveVariantMinutes", () => {
  it("defaults to the longest package within the menu filter", () => {
    expect(resolveVariantMinutes([8, 15, 20])).toBe(20);
    expect(resolveVariantMinutes([8, 15, 20], { menuFilterRaw: "15" })).toBe(15);
  });

  it("honours selected variant when it is available", () => {
    expect(
      resolveVariantMinutes([8, 15, 20], {
        menuFilterRaw: "15",
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
  it("matches resolveVariantMinutes without a selected chip", () => {
    expect(resolveDefaultVariantMinutes([8, 15, 20], "15")).toBe(15);
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
