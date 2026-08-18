/**
 * Contract: docs/specs/service/material-unit.md
 */
import { describe, expect, it } from "vitest";

import { findContentSourceById } from "@/lib/content-sources";
import {
  DEFAULT_WINDOW_DURATION_SEC,
  resolveMaterialUnit,
} from "@/lib/material-unit";

describe("material-unit", () => {
  const cafe = findContentSourceById("es-fixture-cafe")!;

  it("resolves sentence unit skipping frequency stubs", () => {
    const unit = resolveMaterialUnit(cafe, "sentence");
    expect(unit.text).toBe("El café está en la mesa.");
    expect(unit.sentenceCount).toBe(1);
  });

  it("resolves full unit as entire body", () => {
    const unit = resolveMaterialUnit(cafe, "full");
    expect(unit.text).toContain("El café está en la mesa.");
    expect(unit.text).toContain("Uno dos tres.");
  });

  it("resolves window unit with default five-minute cap metadata", () => {
    const unit = resolveMaterialUnit(cafe, "window");
    expect(unit.durationSec).toBe(DEFAULT_WINDOW_DURATION_SEC);
    expect(unit.text.length).toBeGreaterThan(0);
  });

  it("resolves paragraph as first block or token cap", () => {
    const unit = resolveMaterialUnit(cafe, "paragraph");
    expect(unit.text).toContain("café");
  });
});
