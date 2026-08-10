import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { Button } from "./Button";

/** The named check for docs/specs/component/button.md. */

const variants = ["primary", "secondary", "ghost", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;

describe("Button", () => {
  it('defaults to type="button"', () => {
    // A bare <button> inside a form submits it. Anyone who did not pass a type
    // did not intend that.
    render(<Button>Save</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Delete
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("is actually disabled, not just styled as disabled", () => {
    render(<Button disabled>Delete</Button>);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });

  it("lets a caller's className win over the variant's own classes", () => {
    // This is what cn()/twMerge buys us: overriding without a prop per case.
    render(<Button className="rounded-none">Go</Button>);
    const cls = screen.getByRole("button").className;

    expect(cls).toContain("rounded-none");
    expect(cls).not.toContain("rounded-pill");
  });

  it("disables and sets aria-busy when pending", () => {
    render(<Button pending>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button).toHaveProperty("disabled", true);
  });

  it.each(variants)("renders %s with no accessibility violations", async (variant) => {
    const { container } = render(<Button variant={variant}>Action</Button>);
    await expectNoA11yViolations(container);
  });

  it.each(sizes)("renders size %s", (size) => {
    render(<Button size={size}>Action</Button>);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("gives each size a distinct visual height", () => {
    // Regression: the base classes once carried `min-h-11`, which beats
    // `height` in CSS and silently flattened all three sizes to one 44px box.
    // The variants looked correct in the source and did nothing.
    const heights = sizes.map((size) => {
      const { container } = render(<Button size={size}>Action</Button>);
      const cls = container.querySelector("button")!.className;
      cleanup();
      return cls.match(/(?:^|\s)(h-\d+)(?:\s|$)/)?.[1];
    });

    expect(heights).toEqual(["h-8", "h-10", "h-12"]);
    expect(new Set(heights).size).toBe(sizes.length);
  });

  it.each([
    ["sm", "after:-inset-y-1.5"],
    ["md", "after:-inset-y-0.5"],
  ] as const)("expands the %s hit area to 44px", (size, expansion) => {
    // The visual box is under 44px, so the target is grown by a pseudo-element
    // rather than by padding — see docs/specs/component/button.md.
    render(<Button size={size}>Action</Button>);
    expect(screen.getByRole("button").className).toContain(expansion);
  });
});
