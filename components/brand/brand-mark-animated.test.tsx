import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMarkAnimated } from "./BrandMarkAnimated";

describe("BrandMarkAnimated", () => {
  it("renders outer and inner spiral bands for counter-rotation", () => {
    const { container } = render(<BrandMarkAnimated />);

    expect(container.querySelector(".brand-mark-ring-outer")).toBeTruthy();
    expect(container.querySelector(".brand-mark-ring-inner")).toBeTruthy();
  });
});
