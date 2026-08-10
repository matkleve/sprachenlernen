import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { MobileNav } from "./MobileNav";
import { copy } from "./content";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue("/methods");
});

describe("SPEC-feature-mobile-nav", () => {
  it("toggles aria-expanded when the menu button is pressed", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const menuButton = screen.getByRole("button", { name: copy.menuLabel });
    expect(menuButton.getAttribute("aria-expanded")).toBe("false");

    await user.click(menuButton);
    expect(menuButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("lists three destinations with icons when open", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: copy.menuLabel }));

    const nav = screen.getByRole("dialog", { name: copy.navLabel });
    const links = nav.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(3);
    expect([...links].map((link) => link.textContent?.trim())).toEqual([
      copy.destinations.methods,
      copy.destinations.words,
      copy.destinations.progress,
    ]);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: copy.menuLabel }));
    expect(screen.getByRole("dialog", { name: copy.navLabel })).toBeDefined();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: copy.navLabel })).toBeNull();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: copy.menuLabel }));
    await user.click(screen.getByRole("button", { name: copy.menuClose }));

    expect(screen.queryByRole("dialog", { name: copy.navLabel })).toBeNull();
  });

  it("renders sign-out inside the drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: copy.menuLabel }));

    const dialog = screen.getByRole("dialog", { name: copy.navLabel });
    expect(dialog.querySelector(`button[type="submit"]`)?.textContent).toBe(copy.signOut);
  });

  it("has no accessibility violations when open", async () => {
    const user = userEvent.setup();
    const { container } = render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: copy.menuLabel }));
    await expectNoA11yViolations(container);
  });
});
