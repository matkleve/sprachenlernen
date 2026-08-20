import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { fitsMinutes, fitsPartialContext } from "@/lib/method-catalogue";
import {
  filterMethods,
  parseMenuFilter,
  applySearchParamUpdates,
  serializeMultiParam,
  toggleMultiParam,
} from "@/lib/method-menu-filter";

const { catalogue } = loadMethodCatalogue();

describe("parseMenuFilter", () => {
  it("parses minutes and skill", () => {
    const filter = parseMenuFilter({ minutes: "15", skill: "reading" });
    expect(filter.timeBudget).toBe(15);
    expect(filter.skills).toEqual(["reading"]);
  });

  it("parses comma-separated skills and energies", () => {
    const filter = parseMenuFilter({ skill: "reading,listening", energy: "low,high" });
    expect(filter.skills).toEqual(["reading", "listening"]);
    expect(filter.energies).toEqual(["low", "high"]);
  });

  it("parses endless time budget", () => {
    const filter = parseMenuFilter({ minutes: "endless" });
    expect(filter.timeBudget).toBe("endless");
  });
});

describe("toggleMultiParam", () => {
  it("adds and removes values", () => {
    expect(toggleMultiParam(undefined, "reading")).toEqual(["reading"]);
    expect(toggleMultiParam(["reading"], "listening")).toEqual(["reading", "listening"]);
    expect(toggleMultiParam(["reading", "listening"], "reading")).toEqual(["listening"]);
    expect(toggleMultiParam(["reading"], "reading")).toBeUndefined();
  });
});

describe("serializeMultiParam", () => {
  it("joins values for the URL", () => {
    expect(serializeMultiParam(["reading", "listening"])).toBe("reading,listening");
    expect(serializeMultiParam(undefined)).toBeUndefined();
  });
});

describe("filterMethods", () => {
  it("filters by minutes", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ minutes: "2" }));
    const expected = catalogue!.entries
      .filter((e) => e.type === "method")
      .filter((m) => m.type === "method" && fitsMinutes(m, 2));
    expect(result.map((m) => m.id).sort()).toEqual(expected.map((m) => m.id).sort());
  });

  it("filters by energy low", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ energy: "low" }));
    expect(result.every((m) => m.intensity === 1)).toBe(true);
  });

  it("filters by multiple skills with OR semantics", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ skill: "reading,speaking" }));
    expect(
      result.every((m) => m.skills.includes("reading") || m.skills.includes("speaking")),
    ).toBe(true);
    const readingOnly = filterMethods(catalogue!, parseMenuFilter({ skill: "reading" }));
    const speakingOnly = filterMethods(catalogue!, parseMenuFilter({ skill: "speaking" }));
    expect(result.length).toBeGreaterThanOrEqual(readingOnly.length);
    expect(result.length).toBeGreaterThanOrEqual(speakingOnly.length);
  });

  it("filters by multiple energies with OR semantics", () => {
    const lowMedium = filterMethods(catalogue!, parseMenuFilter({ energy: "low,medium" }));
    expect(lowMedium.every((m) => m.intensity <= 2)).toBe(true);
    expect(lowMedium.some((m) => m.intensity === 3)).toBe(false);

    const all = filterMethods(catalogue!, parseMenuFilter({ minutes: "endless" }));
    const lowHigh = filterMethods(catalogue!, parseMenuFilter({ energy: "low,high" }));
    expect(lowHigh.length).toBe(all.length);
  });

  it("does not filter by time when budget is endless", () => {
    const all = catalogue!.entries.filter((e) => e.type === "method");
    const result = filterMethods(catalogue!, parseMenuFilter({ minutes: "endless" }));
    expect(result.length).toBe(all.length);
  });

  it("filters by refine hands=none", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ hands: "none" }));
    expect(
      result.every((m) => fitsPartialContext(m, { hands: "none" })),
    ).toBe(true);
  });

  it("filters by multiple refine values with OR semantics", () => {
    const result = filterMethods(catalogue!, parseMenuFilter({ hands: "none,one" }));
    expect(
      result.every(
        (m) => fitsPartialContext(m, { hands: "none" }) || fitsPartialContext(m, { hands: "one" }),
      ),
    ).toBe(true);
  });

  it("hides sound-requiring methods when listening defer is active", () => {
    const all = filterMethods(catalogue!, parseMenuFilter({ minutes: "endless" }));
    const deferred = filterMethods(
      catalogue!,
      parseMenuFilter({ minutes: "endless" }),
      { deferListening: true },
    );
    expect(deferred.length).toBeLessThan(all.length);
    expect(deferred.every((m) => m.id !== "partial-dictation")).toBe(true);
    expect(deferred.every((m) => m.id !== "audio-cards")).toBe(true);
  });
});

describe("applySearchParamUpdates", () => {
  it("merges updates without dropping unrelated params", () => {
    const next = applySearchParamUpdates(
      { minutes: "15", skill: "reading" },
      { energy: "low" },
    );
    expect(next).toEqual({ minutes: "15", skill: "reading", energy: "low" });
  });

  it("clears a param when the update value is undefined", () => {
    const next = applySearchParamUpdates({ minutes: "15", skill: "reading" }, { skill: undefined });
    expect(next).toEqual({ minutes: "15" });
  });
});
