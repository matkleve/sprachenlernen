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

  it("wraps long mobile titles to two lines instead of truncating", () => {
    render(<ShellPageTitle variant="mobile" />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.className).toContain("line-clamp-2");
    expect(title.className).not.toContain("truncate");
    expect(title.className).not.toContain("absolute");
  });
});
