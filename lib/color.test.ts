import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { composite, contrast, luminance, parseHex } from "../scripts/lib/color.mjs";

const CSS = join(import.meta.dirname, "..", "app", "globals.css");
const css = readFileSync(CSS, "utf8");

function token(name: string) {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]+)`));
  if (!match) throw new Error(`missing token: ${name}`);
  return match[1];
}

describe("color contrast math", () => {
  it("parses token hex from globals.css", () => {
    const ink = token("ink");
    expect(parseHex(ink).every((v) => v >= 0 && v <= 255)).toBe(true);
  });

  it("reports high contrast for ink on canvas", () => {
    expect(contrast(token("ink"), token("canvas"))).toBeGreaterThan(10);
  });

  it("is order-independent", () => {
    const a = token("accent");
    const b = token("surface");
    expect(contrast(a, b)).toBeCloseTo(contrast(b, a), 5);
  });

  it("composites foreground over background", () => {
    const blended = composite(token("ink"), token("surface"), 0.5);
    expect(luminance(blended)).toBeGreaterThan(luminance(token("ink")));
    expect(luminance(blended)).toBeLessThan(luminance(token("surface")));
  });

  it("returns 1:1 for identical fills", () => {
    const surface = token("surface");
    expect(contrast(surface, surface)).toBeCloseTo(1, 5);
  });
});
