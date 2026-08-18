import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMarkAnimated } from "./BrandMarkAnimated";

describe("BrandMarkAnimated", () => {
  it("renders outer and inner spiral bands around a shared pivot", () => {
    const { container } = render(<BrandMarkAnimated />);

    expect(container.querySelector(".brand-mark-ring-outer")).toBeTruthy();
    expect(container.querySelector(".brand-mark-ring-inner")).toBeTruthy();
    expect(container.querySelector('g[transform="translate(256 256)"]')).toBeTruthy();
  });
});
