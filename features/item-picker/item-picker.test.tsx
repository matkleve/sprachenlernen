import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { ItemPicker } from "./ItemPicker";
import { copy, type Item } from "./content";

/**
 * The named check for docs/specs/feature/item-picker.md.
 * Each test maps to one acceptance criterion in that spec — when a criterion
 * changes, this file changes in the same commit.
 */

const items: Item[] = [
  { id: "a", title: "Alpha", body: "Body of alpha." },
  { id: "b", title: "Bravo", body: "Body of bravo." },
];

describe("ItemPicker", () => {
  it("shows the empty state and no item body before anything is selected", () => {
    render(<ItemPicker items={items} />);

    expect(screen.getByText(copy.emptyTitle)).toBeDefined();
    expect(screen.queryByText("Body of alpha.")).toBeNull();
    expect(screen.queryByText("Body of bravo.")).toBeNull();
  });

  it("leaves no residue of the previous selection when switching", async () => {
    // This is the criterion the whole feature exists for. Asserting that B is
    // shown is not enough — the bug this prevents is B shown *next to* stale A.
    const user = userEvent.setup();
    const { container } = render(<ItemPicker items={items} />);

    await user.click(screen.getByRole("button", { name: "Alpha" }));
    expect(screen.getByText("Body of alpha.")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Bravo" }));

    expect(screen.getByText("Body of bravo.")).toBeDefined();
    expect(container.textContent).not.toContain("Body of alpha.");
  });

  it("marks exactly one row as current", async () => {
    const user = userEvent.setup();
    render(<ItemPicker items={items} />);

    await user.click(screen.getByRole("button", { name: "Bravo" }));

    const current = screen
      .getAllByRole("button")
      .filter((el) => el.getAttribute("aria-current") === "true");

    expect(current).toHaveLength(1);
    expect(current[0]?.textContent).toBe("Bravo");
  });

  it("renders identically when the already-selected row is activated again", async () => {
    const user = userEvent.setup();
    const { container } = render(<ItemPicker items={items} />);

    await user.click(screen.getByRole("button", { name: "Bravo" }));
    const before = container.innerHTML;

    await user.click(screen.getByRole("button", { name: "Bravo" }));

    expect(container.innerHTML).toBe(before);
  });

  it("selects with the keyboard and keeps focus on the row", async () => {
    // Focus must not jump to the detail panel — a keyboard user would lose
    // their place in the list and have to tab back through it every time.
    const user = userEvent.setup();
    render(<ItemPicker items={items} />);

    const bravo = screen.getByRole("button", { name: "Bravo" });
    bravo.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Body of bravo.")).toBeDefined();
    expect(document.activeElement).toBe(bravo);
  });

  it("has no accessibility violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<ItemPicker items={items} />);

    await user.click(screen.getByRole("button", { name: "Alpha" }));

    await expectNoA11yViolations(container);
  });
});
