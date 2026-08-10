import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { ActionLink } from "./ActionLink";
import { Button } from "./Button";
import { NavLink, navLinkVariants } from "./NavLink";
import { SubmitButton } from "./SubmitButton";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

/** Contract smoke tests for docs/specs/feature/interaction-feedback.md */

describe("interaction-feedback contract", () => {
  it("Button includes press (active) feedback classes", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").className).toContain("active:scale");
  });

  it("NavLink variants include press (active) feedback classes", () => {
    expect(navLinkVariants()).toContain("active:scale");
  });

  it("Button sets aria-busy and disables when pending", () => {
    render(<Button pending>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button).toHaveProperty("disabled", true);
  });

  it("Button does not call onClick while pending", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button pending onClick={onClick}>
        Save
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("ActionLink renders with button styling and touch-manipulation", () => {
    render(
      <ActionLink href="/words" variant="primary">
        Start
      </ActionLink>,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/words");
    expect(link.className).toContain("touch-manipulation");
    expect(link.className).toContain("bg-accent");
  });

  it("SubmitButton renders a submit button inside a form", () => {
    render(
      <form>
        <SubmitButton>Sign in</SubmitButton>
      </form>,
    );

    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  it("NavLink has no axe violations with pending navigation hook", async () => {
    const { container } = render(
      <nav aria-label="Destinations">
        <NavLink href="/methods" current>
          Methods
        </NavLink>
      </nav>,
    );
    await expectNoA11yViolations(container);
  });
});
