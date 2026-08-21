import { describe, expect, it } from "vitest";

import { DEV_PAGES, devPagesSortedByLatest } from "@/lib/dev-pages";
import { routes } from "@/lib/routes";

describe("devPagesSortedByLatest", () => {
  it("lists every dev page from the registry", () => {
    expect(DEV_PAGES.length).toBe(10);
  });

  it("sorts newest lastUpdatedAt first", () => {
    const sorted = devPagesSortedByLatest();
    for (let i = 1; i < sorted.length; i++) {
      const newer = sorted[i - 1];
      const older = sorted[i];
      expect(newer).toBeDefined();
      expect(older).toBeDefined();
      expect(newer!.lastUpdatedAt).toBeGreaterThanOrEqual(older!.lastUpdatedAt);
    }
    expect(sorted[0]?.href).toBe(routes.woodGrainLab);
    expect(sorted.at(-1)?.href).toBe(routes.designExplorer);
  });
});
