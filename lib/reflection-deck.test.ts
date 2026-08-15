import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Contract: docs/specs/component/reflection-deck.md
 *
 * UI not implemented yet. Guards the interaction contract the owner agreed on
 * so the spec cannot drift before code lands.
 */

const spec = readFileSync(
  join(process.cwd(), "docs/specs/component/reflection-deck.md"),
  "utf8",
);

describe("reflection-deck spec contract", () => {
  it("requires swipe and button navigation", () => {
    expect(spec).toMatch(/Swipes? left/i);
    expect(spec).toMatch(/Previous/);
    expect(spec).toMatch(/swipe is not the only route/i);
  });

  it("caps the deck at five cards", () => {
    expect(spec).toMatch(/1.?5/);
  });

  it("places headline above the visual", () => {
    expect(spec).toMatch(/Headline.*visual/i);
  });
});
