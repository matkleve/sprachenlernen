/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { designThemePresets, designThemeStorageKey } from "@/lib/design-themes";

import { DesignExplorer } from "./DesignExplorer";
import { page } from "./content";

vi.mock("./fonts", () => ({
  themeBodyFontClass: () => "",
  themeDisplayFontClass: () => "",
}));

describe("DesignExplorer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("shows five direction cards with metadata chips", () => {
    render(<DesignExplorer />);

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);

    for (const preset of designThemePresets) {
      const card = cards.find((entry) =>
        within(entry).queryByRole("heading", { name: preset.name }),
      );
      expect(card).toBeTruthy();
      within(card!).getByText(`${page.chips.font}: ${preset.fontLabel}`);
      within(card!).getByText(`${page.chips.radius}: ${preset.radiusLabel}`);
      within(card!).getByText(`${page.chips.border}: ${preset.borderLabel}`);
    }
  });

  it("persists a single selected direction", async () => {
    const user = userEvent.setup();
    render(<DesignExplorer />);

    const warmScholar = designThemePresets.find((preset) => preset.id === "warm-scholar");
    if (!warmScholar) throw new Error("warm-scholar preset missing");

    const chooseButtons = screen.getAllByRole("button", { name: page.chooseLabel });
    const secondButton = chooseButtons[1];
    if (!secondButton) throw new Error("second choose button missing");

    await user.click(secondButton);

    expect(window.localStorage.getItem(designThemeStorageKey)).toBe("warm-scholar");

    cleanup();
    render(<DesignExplorer />);

    await waitFor(() => {
      expect(screen.getByTestId("design-explorer-banner").textContent).toContain(
        warmScholar.name,
      );
    });
  });

  it("replaces the previous selection without residue", async () => {
    window.localStorage.setItem(designThemeStorageKey, "baseline");
    const user = userEvent.setup();
    render(<DesignExplorer />);

    const boldFocus = designThemePresets.find((preset) => preset.id === "bold-focus");
    if (!boldFocus) throw new Error("bold-focus preset missing");

    const chooseButtons = screen.getAllByRole("button", { name: page.chooseLabel });
    const boldChoose = chooseButtons.find((button) =>
      button.closest("article")?.textContent?.includes(boldFocus.name),
    );
    if (!boldChoose) throw new Error("bold-focus choose button missing");

    await user.click(boldChoose);

    expect(window.localStorage.getItem(designThemeStorageKey)).toBe("bold-focus");

    await waitFor(() => {
      const banner = screen.getByTestId("design-explorer-banner");
      expect(banner.textContent).toContain(boldFocus.name);
      expect(banner.textContent).not.toContain("Baseline");
    });
  });
});
