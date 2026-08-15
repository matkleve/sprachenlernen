import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  readVisualViewportBottomInset,
  syncVisualViewportBottomInset,
  useVisualViewportBottomInset,
  VISUAL_VIEWPORT_BOTTOM_INSET_VAR,
} from "./useVisualViewportBottomInset";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/methods"),
}));

import { usePathname } from "next/navigation";

describe("readVisualViewportBottomInset", () => {
  it("returns the gap between layout and visual viewport", () => {
    vi.stubGlobal("innerHeight", 750);
    vi.stubGlobal("visualViewport", { height: 700, offsetTop: 0 });

    expect(readVisualViewportBottomInset()).toBe(50);
  });
});

describe("useVisualViewportBottomInset", () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    vi.mocked(usePathname).mockReturnValue("/methods");
  });

  afterEach(() => {
    document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    vi.unstubAllGlobals();
  });

  it("sets the bottom inset from visualViewport when browser chrome is visible", () => {
    const listeners = new Map<string, Set<() => void>>();
    const viewport = {
      height: 700,
      offsetTop: 0,
      addEventListener: (type: string, handler: () => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(handler);
      },
      removeEventListener: (type: string, handler: () => void) => {
        listeners.get(type)?.delete(handler);
      },
    };

    vi.stubGlobal("innerHeight", 750);
    vi.stubGlobal("visualViewport", viewport);

    const { unmount } = renderHook(() => useVisualViewportBottomInset());

    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("50px");

    viewport.height = 748;
    listeners.get("resize")?.forEach((handler) => handler());
    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("2px");

    unmount();
    expect(document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR)).toBe(
      "",
    );
  });

  it("re-syncs inset when pathname changes without a visualViewport resize", () => {
    const viewport = {
      height: 750,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.stubGlobal("innerHeight", 750);
    vi.stubGlobal("visualViewport", viewport);

    const { rerender } = renderHook(() => useVisualViewportBottomInset());

    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("0px");

    viewport.height = 700;
    vi.mocked(usePathname).mockReturnValue("/words");
    rerender();

    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("50px");
  });
});

describe("syncVisualViewportBottomInset", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    vi.unstubAllGlobals();
  });

  it("writes the current measurement to the document root", () => {
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal("visualViewport", { height: 760, offsetTop: 0 });

    syncVisualViewportBottomInset();

    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("40px");
  });
});
