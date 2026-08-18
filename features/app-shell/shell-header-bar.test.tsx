import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShellHeaderBar } from "./ShellHeaderBar";

describe("ShellHeaderBar", () => {
  it("renders mobile chrome fixed at the top with a scrim layer", () => {
    const { container } = render(
      <ShellHeaderBar
        variant="mobile"
        collapse={1}
        left={<span>left</span>}
        center={<span>center</span>}
        right={<span>right</span>}
      />,
    );

    expect(container.querySelector(".fixed.inset-x-0.top-0")).toBeTruthy();
    expect(container.querySelector(".header-scrim-blur")).toBeTruthy();
    expect(container.textContent).toContain("center");
  });

  it("uses the same icon gap on desktop left and right", () => {
    const { container } = render(
      <ShellHeaderBar
        variant="desktop"
        collapse={0}
        left={<span data-testid="left">left</span>}
        right={<span data-testid="right">right</span>}
      />,
    );

    const left = container.querySelector(".justify-self-start");
    const right = container.querySelector(".justify-self-end");
    expect(left?.className).toContain("gap-3");
    expect(right?.className).toContain("gap-3");
  });

  it("renders desktop chrome sticky with a scrim layer", () => {
    const { container } = render(
      <ShellHeaderBar
        variant="desktop"
        collapse={1}
        left={<span>left</span>}
        center={<span>center</span>}
        right={<span>right</span>}
      />,
    );

    const header = container.querySelector("header.sticky");
    expect(header).toBeTruthy();
    expect(header?.querySelector(".header-scrim-blur")).toBeTruthy();
  });
});
