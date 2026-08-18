import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShellPageLoading } from "./ShellPageLoading";

describe("ShellPageLoading", () => {
  it("matches destination page wrapper rhythm", () => {
    const { container } = render(<ShellPageLoading />);
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain("max-w-5xl");
    expect(wrapper?.className).toContain("pb-page-bottom");
    expect(wrapper?.className).toContain("md:pt-page-top");
    expect(wrapper?.className.split(" ")).not.toContain("pt-page-top");
  });

  it("exposes a polite loading status", () => {
    const { getByRole } = render(<ShellPageLoading />);
    expect(getByRole("status").getAttribute("aria-live")).toBe("polite");
  });
});
