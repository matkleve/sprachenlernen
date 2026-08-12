import { describe, expect, it } from "vitest";

import {
  MOBILE_TITLE_LARGE_PX,
  desktopShellTitleMaxWidth,
  mobileShellTitleClampedMaxWidth,
  mobileShellTitleMaxWidth,
  mobileTitleWrapsTwoLines,
  shellHeaderCollapseValue,
  shellTitleFontSize,
} from "./shell-page-title-layout";

describe("mobileShellTitleMaxWidth", () => {
  it("scales max width with font size when the title wraps to two lines", () => {
    const atTop = mobileShellTitleMaxWidth(true, MOBILE_TITLE_LARGE_PX, 0);
    const scrolled = mobileShellTitleMaxWidth(true, 14, 1);

    expect(atTop).toBe("11rem");
    expect(scrolled).toBe(`${(11 * 14) / MOBILE_TITLE_LARGE_PX}rem`);
    expect(parseFloat(scrolled)).toBeLessThan(parseFloat(atTop));
  });

  it("narrows max width smoothly on scroll for single-line titles", () => {
    expect(mobileShellTitleMaxWidth(false, MOBILE_TITLE_LARGE_PX, 0)).toBe("11rem");
    expect(mobileShellTitleMaxWidth(false, MOBILE_TITLE_LARGE_PX, 0.5)).toBe("10rem");
    expect(mobileShellTitleMaxWidth(false, 14, 1)).toBe("9rem");
  });
});

describe("shellTitleFontSize", () => {
  it("interpolates between large and small sizes", () => {
    expect(shellTitleFontSize(24, 14, 0)).toBe(24);
    expect(shellTitleFontSize(24, 14, 0.5)).toBe(19);
    expect(shellTitleFontSize(24, 14, 1)).toBe(14);
  });
});

describe("desktopShellTitleMaxWidth", () => {
  it("interpolates max width with collapse instead of stepping", () => {
    expect(desktopShellTitleMaxWidth(0)).toBe("min(70vw, 20rem)");
    expect(desktopShellTitleMaxWidth(0.5)).toBe("min(61vw, 17rem)");
    expect(desktopShellTitleMaxWidth(1)).toBe("min(52vw, 14rem)");
  });
});

describe("shellHeaderCollapseValue", () => {
  it("clamps scroll position to 0–1", () => {
    expect(shellHeaderCollapseValue(0, 72)).toBe(0);
    expect(shellHeaderCollapseValue(36, 72)).toBe(0.5);
    expect(shellHeaderCollapseValue(100, 72)).toBe(1);
  });
});

describe("mobileTitleWrapsTwoLines", () => {
  it("detects when scroll height exceeds one line", () => {
    expect(mobileTitleWrapsTwoLines(20, 16)).toBe(false);
    expect(mobileTitleWrapsTwoLines(33, 16)).toBe(true);
  });
});

describe("mobileShellTitleClampedMaxWidth", () => {
  it("clamps max width so the title cannot overlap corner chips", () => {
    expect(mobileShellTitleClampedMaxWidth("11rem")).toBe("min(11rem, calc(100vw - 7rem))");
  });
});
