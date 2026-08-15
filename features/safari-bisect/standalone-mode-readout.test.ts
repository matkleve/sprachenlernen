import { afterEach, describe, expect, it, vi } from "vitest";

import { isStandaloneDisplayMode } from "./StandaloneModeReadout";

describe("isStandaloneDisplayMode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for iOS navigator.standalone", () => {
    vi.stubGlobal("navigator", { standalone: true });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));

    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it("returns false in a normal browser tab", () => {
    vi.stubGlobal("navigator", { standalone: false });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));

    expect(isStandaloneDisplayMode()).toBe(false);
  });
});
