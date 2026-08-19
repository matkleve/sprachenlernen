import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";

/**
 * Contract: docs/specs/service/practice-model.md § Shipped vs catalogue.
 *
 * The spec states four counts. They were correct when written; nothing stopped
 * them going stale the next time an entry was added, which is what a table of
 * numbers in prose always does.
 */
describe("practice-model counts", () => {
  const menu = loadMethodCatalogue();
  const entries = menu.catalogue?.entries ?? [];

  it("loads the shipped catalogue", () => {
    expect(menu.errors).toEqual([]);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("ships the counts the contract states", () => {
    const methods = entries.filter((entry) => entry.type !== "commitment");
    const hosted = methods.filter((entry) => entry.hosted === true);

    expect(methods).toHaveLength(53);
    expect(hosted).toHaveLength(34);
    expect(methods.length - hosted.length).toBe(19);
  });

  it("has seven built in-app engines (card + six exercise runners)", () => {
    const builtExercise = [
      "partial-dictation",
      "full-dictation",
      "extensive-reading",
      "reading-aloud",
      "build-a-sentence",
      "free-production",
    ];
    expect(entries.some((entry) => entry.id === "srs-session")).toBe(true);
    for (const id of builtExercise) {
      expect(entries.some((entry) => entry.id === id)).toBe(true);
    }
  });
});
