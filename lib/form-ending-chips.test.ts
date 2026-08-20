/**
 * Contract: docs/specs/service/form-practice.md (build route §)
 */
import { describe, expect, it } from "vitest";

import {
  buildEndingChips,
  endingFromSurface,
  spanishVerbStem,
} from "@/lib/form-ending-chips";

describe("form-ending-chips", () => {
  it("extracts regular verb endings from surfaces", () => {
    expect(spanishVerbStem("hablar")).toBe("habl");
    expect(endingFromSurface("habla", "hablar")).toBe("a");
    expect(endingFromSurface("hablamos", "hablar")).toBe("amos");
  });

  it("builds a deduplicated chip set capped at fifteen", () => {
    const chips = buildEndingChips([
      {
        lemma: "hablar",
        surfaces: ["hablo", "hablas", "habla", "hablamos", "habláis", "hablan"],
      },
      {
        lemma: "comer",
        surfaces: ["como", "comes", "come", "comemos", "coméis", "comen"],
      },
    ]);

    expect(chips.length).toBeLessThanOrEqual(15);
    expect(chips).toContain("a");
    expect(chips).toContain("o");
    expect(new Set(chips).size).toBe(chips.length);
  });

  it("spans more than one paradigm class when the session pool does", () => {
    const chips = buildEndingChips([
      { lemma: "hablar", surfaces: ["habla", "hablaba", "habló"] },
      { lemma: "vivir", surfaces: ["vive", "vivía", "vivió"] },
    ]);

    expect(chips.some((chip) => chip.includes("aba") || chip === "aba")).toBe(true);
    expect(chips.some((chip) => chip.includes("ó") || chip === "ó")).toBe(true);
  });
});
