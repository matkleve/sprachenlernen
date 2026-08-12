import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";

describe("loadMethodCatalogue", () => {
  it("reuses the parsed production catalogue within a process", () => {
    const first = loadMethodCatalogue();
    const second = loadMethodCatalogue();

    expect(first).toBe(second);
    expect(first.catalogue?.entries.length).toBeGreaterThan(0);
  });
});
