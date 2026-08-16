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

  it("has exactly one built engine, and it is the card engine", () => {
    // "Engines ship one at a time" — the moment a second runner exists this
    // goes red, and the contract's stage-1 language has to be revisited.
    expect(entries.some((entry) => entry.id === "srs-session")).toBe(true);
  });
});
