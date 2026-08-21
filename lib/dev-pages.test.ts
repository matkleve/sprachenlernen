import { describe, expect, it } from "vitest";

import { devPagesByRecency, formatDevPageUpdatedAt } from "@/lib/dev-pages";
import { routes } from "@/lib/routes";

/** Contract: docs/specs/page/profile.md § Section navigation */

describe("devPagesByRecency", () => {
  it("lists every dev preview route from lib/routes.ts", () => {
    const hrefs = devPagesByRecency().map((page) => page.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        routes.profileDevSentenceRealizer,
        routes.woodGrainLab,
        routes.progressionExplorer,
        routes.materialExplorer,
        routes.woodTextureLab,
        routes.designExplorer,
        routes.brandExplorer,
        routes.methodCardAssets,
        routes.primitives,
        routes.safariBisect,
      ]),
    );
    expect(hrefs).toHaveLength(10);
  });

  it("sorts newest updatedAt first", () => {
    const pages = devPagesByRecency();
    for (let index = 0; index < pages.length - 1; index++) {
      const current = pages[index]!;
      const next = pages[index + 1]!;
      expect(current.updatedAt.localeCompare(next.updatedAt)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("formatDevPageUpdatedAt", () => {
  it("formats ISO dates for the dev list", () => {
    expect(formatDevPageUpdatedAt("2026-08-21")).toBe("21 Aug 2026");
  });
});
