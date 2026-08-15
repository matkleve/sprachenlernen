import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  useVisualViewportBottomInset,
  VISUAL_VIEWPORT_BOTTOM_INSET_VAR,
} from "./useVisualViewportBottomInset";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/methods"),
}));

describe("useVisualViewportBottomInset", () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
    vi.stubGlobal("navigator", { standalone: false });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });

  afterEach(() => {
    document.documentElement.style.removeProperty(VISUAL_VIEWPORT_BOTTOM_INSET_VAR);
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

  it("forces 0px inset in standalone PWA even when visualViewport reports a gap", () => {
    vi.stubGlobal("navigator", { standalone: true });
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.stubGlobal("innerHeight", 750);
    vi.stubGlobal("visualViewport", {
      height: 700,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { unmount } = renderHook(() => useVisualViewportBottomInset());

    expect(
      document.documentElement.style.getPropertyValue(VISUAL_VIEWPORT_BOTTOM_INSET_VAR),
    ).toBe("0px");

    unmount();
  });
});
