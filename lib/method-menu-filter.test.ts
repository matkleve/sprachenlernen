import { describe, expect, it } from "vitest";

import { filterByContext } from "@/lib/method-catalogue";
import { filterMethods, parseMenuFilter } from "@/lib/method-menu-filter";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";

const { catalogue, presets } = loadMethodCatalogue();

describe("parseMenuFilter", () => {
  it("parses a preset", () => {
    const filter = parseMenuFilter({ context: "kitchen" }, presets ?? []);
    expect(filter.kind).toBe("filtered");
    if (filter.kind === "filtered") {
      expect(filter.presetId).toBe("kitchen");
    }
  });

  it("parses time-only", () => {
    const filter = parseMenuFilter({ time: "2" }, presets ?? []);
    expect(filter).toEqual({ kind: "time-only", time: "2" });
  });
});

describe("filterMethods", () => {
  it("filters by time budget alone", () => {
    const all = catalogue!.entries.filter((e) => e.type === "method");
    const short = all.filter((m) => m.type === "method" && m.durations !== null && Math.min(...m.durations) <= 2);
    const result = filterMethods(catalogue!, { kind: "time-only", time: "2" });
    expect(result.map((m) => m.id).sort()).toEqual(short.map((m) => m.id).sort());
  });

  it("matches filterByContext for a preset", () => {
    const preset = presets!.find((p) => p.id === "kitchen")!;
    const filter = parseMenuFilter({ context: "kitchen" }, presets!);
    const result = filterMethods(catalogue!, filter);
    expect(result.map((m) => m.id).sort()).toEqual(
      filterByContext(catalogue!, preset.context)
        .map((m) => m.id)
        .sort(),
    );
  });
});
