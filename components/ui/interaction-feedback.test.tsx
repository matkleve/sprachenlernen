import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { ActionLink } from "./ActionLink";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { IconLink } from "./IconLink";
import { NavLink, navLinkVariants } from "./NavLink";
import { disclosureSummaryClass } from "./Disclosure";
import { cardPressable } from "./interaction-kernel";
import { SubmitButton } from "./SubmitButton";
import { textLinkVariants } from "./TextLink";
import { MIN_PENDING_DISPLAY_MS } from "./use-pending-navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

/** Contract smoke tests for docs/specs/feature/interaction-feedback.md */

describe("interaction-feedback contract", () => {
  it("Button includes press (active) feedback classes", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").className).toContain("active:scale");
  });

  it("floating Button includes active fill for touch-visible press", () => {
    render(
      <Button variant="floating" size="sm">
        Chip
      </Button>,
    );
    expect(screen.getByRole("button").className).toContain("active:bg-accent-soft");
  });

  it("secondary Button includes active fill for touch-visible press", () => {
    render(<Button variant="secondary">Try again</Button>);
    expect(screen.getByRole("button").className).toContain("active:bg-accent-soft");
  });

  it("NavLink variants include press (active) feedback classes", () => {
    expect(navLinkVariants()).toContain("active:scale");
  });

  it("TextLink variants include press (active) feedback classes", () => {
    expect(textLinkVariants()).toContain("active:scale");
  });

  it("DisclosureSummary includes press and focus feedback classes", () => {
    expect(disclosureSummaryClass).toContain("active:scale");
    expect(disclosureSummaryClass).toContain("focus-visible:ring-accent");
  });

  it("cardPressable includes lift hover and accent fill on press", () => {
    expect(cardPressable.join(" ")).toContain("hover:-translate-y-px");
    expect(cardPressable.join(" ")).toContain("active:bg-accent-soft");
  });

  it("Button sets aria-busy and disables when pending", () => {
    render(<Button pending>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button).toHaveProperty("disabled", true);
  });

  it("IconButton uses nav pending ring instead of opacity-only on floating", () => {
    render(
      <IconButton pending aria-label="Profile">
        X
      </IconButton>,
    );
    expect(screen.getByRole("button").className).toContain("ring-accent");
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

  it("IconLink renders round floating chip with nav pending policy", () => {
    render(
      <IconLink href="/profile" aria-label="Profile">
        P
      </IconLink>,
    );

    const link = screen.getByRole("link");
    expect(link.className).toContain("rounded-full");
    expect(link.className).toContain("size-11");
  });

  it("IconLink applies accent fill and aria-current when current", () => {
    render(
      <IconLink href="/profile" aria-label="Profile" current>
        P
      </IconLink>,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toContain("bg-accent");
  });

  it("ActionLink applies accent fill and aria-current when current", () => {
    render(
      <ActionLink href="/profile" variant="ghost" size="sm" current>
        Account
      </ActionLink>,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-current")).toBe("page");
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
        <NavLink href="/methods" current pendingPolicy="nav">
          Methods
        </NavLink>
        <NavLink href="/words" pendingPolicy="nav">
          Words
        </NavLink>
      </nav>,
    );
    await expectNoA11yViolations(container);
  });

  it("NavLink with nav pending policy does not dim while pending", () => {
    render(
      <NavLink href="/words" pendingPolicy="nav">
        Words
      </NavLink>,
    );
    expect(screen.getByRole("link").className).not.toContain("opacity-70");
  });

  it("exports minimum pending display duration for perceptible nav feedback", () => {
    expect(MIN_PENDING_DISPLAY_MS).toBeGreaterThanOrEqual(150);
  });
});
