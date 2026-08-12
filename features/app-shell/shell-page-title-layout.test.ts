import { describe, expect, it } from "vitest";

import {
  MOBILE_TITLE_LARGE_PX,
  mobileShellTitleMaxWidth,
  mobileTitleWrapsTwoLines,
} from "./shell-page-title-layout";

describe("mobileShellTitleMaxWidth", () => {
  it("scales max width with font size when the title wraps to two lines", () => {
    const atTop = mobileShellTitleMaxWidth(true, MOBILE_TITLE_LARGE_PX, 0);
    const scrolled = mobileShellTitleMaxWidth(true, 14, 1);

    expect(atTop).toBe("11rem");
    expect(scrolled).toBe(`${(11 * 14) / MOBILE_TITLE_LARGE_PX}rem`);
    expect(parseFloat(scrolled)).toBeLessThan(parseFloat(atTop));
  });

  it("narrows max width on scroll for single-line titles", () => {
    expect(mobileShellTitleMaxWidth(false, MOBILE_TITLE_LARGE_PX, 0)).toBe("11rem");
    expect(mobileShellTitleMaxWidth(false, 14, 1)).toBe("9rem");
  });
});

describe("mobileTitleWrapsTwoLines", () => {
  it("detects when scroll height exceeds one line", () => {
    expect(mobileTitleWrapsTwoLines(20, 16)).toBe(false);
    expect(mobileTitleWrapsTwoLines(33, 16)).toBe(true);
  });
});
