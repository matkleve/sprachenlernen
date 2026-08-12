import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShellPageTitle } from "./ShellPageTitle";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("./useHeaderCollapse", () => ({
  useHeaderCollapse: vi.fn(() => 0),
}));

describe("ShellPageTitle", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/methods/srs-session");
  });

  it("viewport-centers long mobile titles with absolute positioning", () => {
    render(<ShellPageTitle variant="mobile" />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.className).toContain("line-clamp-2");
    expect(title.className).toContain("absolute");
    expect(title.className).toContain("left-1/2");
    expect(title.className).toContain("-translate-x-1/2");
    expect(title.className).not.toContain("truncate");
  });

  it("expands shell top padding when the mobile title wraps to two lines", () => {
    vi.mocked(usePathname).mockReturnValue("/methods");
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      lineHeight: "24px",
    } as CSSStyleDeclaration);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(80);

    render(<ShellPageTitle variant="mobile" />);

    expect(document.documentElement.style.getPropertyValue("--shell-float-top-active")).toBe(
      "var(--spacing-shell-float-top-expanded)",
    );
  });
});
