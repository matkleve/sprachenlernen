import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Contract: docs/specs/feature/weekly-reflection.md
 *
 * Feature not implemented yet. Guards the weekly reflection rules before F76
 * code lands.
 */

const spec = readFileSync(
  join(process.cwd(), "docs/specs/feature/weekly-reflection.md"),
  "utf8",
);

describe("weekly-reflection spec contract", () => {
  it("opens a reflection deck from the progress entry row", () => {
    expect(spec).toMatch(/ReflectionDeck/);
    expect(spec).toMatch(/\/progress/);
  });

  it("limits cards to facts new this week", () => {
    expect(spec).toMatch(/non-repeatable fact/i);
    expect(spec).toMatch(/between 1\s+and 5/i);
  });

  it("requires personal and factual copy", () => {
    expect(spec).toMatch(/Personal \+ factual/);
    expect(spec).toMatch(/informational\/controlling/i);
  });
});
