import { describe, expect, it } from "vitest";

import { shellBackTarget } from "./back-target";
import { copy } from "./content";

describe("shellBackTarget", () => {
  it("returns null on destination roots", () => {
    expect(shellBackTarget("/methods")).toBeNull();
    expect(shellBackTarget("/words")).toBeNull();
    expect(shellBackTarget("/progress")).toBeNull();
  });

  it("links review to Words", () => {
    expect(shellBackTarget("/words/review")).toEqual({
      href: "/words",
      label: copy.destinations.words,
    });
  });

  it("links method detail to Methods", () => {
    expect(shellBackTarget("/methods/srs-session")).toEqual({
      href: "/methods",
      label: copy.destinations.methods,
    });
  });
});
