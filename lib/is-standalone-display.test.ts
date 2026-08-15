import { afterEach, describe, expect, it, vi } from "vitest";

import { isStandaloneDisplay } from "./is-standalone-display";

describe("isStandaloneDisplay", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for iOS navigator.standalone", () => {
    vi.stubGlobal("navigator", { standalone: true });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));

    expect(isStandaloneDisplay()).toBe(true);
  });

  it("returns false in a normal browser tab", () => {
    vi.stubGlobal("navigator", { standalone: false });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));

    expect(isStandaloneDisplay()).toBe(false);
  });
});
