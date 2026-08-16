/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { brandMarkStorageKey, logoDirections } from "@/lib/brand-mark";

import { BrandExplorer } from "./BrandExplorer";
import { page } from "./content";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...props} />
  ),
}));

describe("BrandExplorer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("shows five direction cards with size previews and header lockups", () => {
    render(<BrandExplorer />);

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);

    for (const direction of logoDirections) {
      const card = cards.find((entry) =>
        within(entry).queryByRole("heading", { name: direction.name }),
      );
      expect(card).toBeTruthy();
      within(card!).getByText(page.preview.sizes);
      within(card!).getByText(page.preview.lockup);
      within(card!).getByText(page.preview.wordmark);
    }
  });

  it("shows a shipped chip on the production mark", () => {
    render(<BrandExplorer />);

    const shipped = logoDirections.find((direction) => direction.shipped);
    expect(shipped).toBeTruthy();

    const cards = screen.getAllByRole("article");
    const shippedCard = cards.find((entry) =>
      within(entry).queryByRole("heading", { name: shipped!.name }),
    );
    expect(shippedCard).toBeTruthy();
    within(shippedCard!).getByText(page.shippedLabel);
  });

  it("persists a single selected direction", async () => {
    const user = userEvent.setup();
    render(<BrandExplorer />);

    const openFolio = logoDirections.find((direction) => direction.id === "open-folio");
    if (!openFolio) throw new Error("open-folio direction missing");

    const chooseButtons = screen.getAllByRole("button", { name: page.chooseLabel });
    const openFolioButton = chooseButtons.find((button) =>
      button.closest("article")?.textContent?.includes(openFolio.name),
    );
    if (!openFolioButton) throw new Error("open-folio choose button missing");

    await user.click(openFolioButton);

    expect(window.localStorage.getItem(brandMarkStorageKey)).toBe("open-folio");

    cleanup();
    render(<BrandExplorer />);

    await waitFor(() => {
      expect(screen.getByTestId("brand-explorer-banner").textContent).toContain(openFolio.name);
    });
  });

  it("replaces the previous selection without residue", async () => {
    window.localStorage.setItem(brandMarkStorageKey, "warm-scholar-bars");
    const user = userEvent.setup();
    render(<BrandExplorer />);

    const languageOrbit = logoDirections.find((direction) => direction.id === "language-orbit");
    if (!languageOrbit) throw new Error("language-orbit direction missing");

    const chooseButtons = screen.getAllByRole("button", { name: page.chooseLabel });
    const orbitButton = chooseButtons.find((button) =>
      button.closest("article")?.textContent?.includes(languageOrbit.name),
    );
    if (!orbitButton) throw new Error("language-orbit choose button missing");

    await user.click(orbitButton);

    expect(window.localStorage.getItem(brandMarkStorageKey)).toBe("language-orbit");

    await waitFor(() => {
      const banner = screen.getByTestId("brand-explorer-banner");
      expect(banner.textContent).toContain(languageOrbit.name);
      expect(banner.textContent).not.toContain("Scholar bars");
    });
  });
});
