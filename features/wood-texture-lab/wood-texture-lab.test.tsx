/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WoodTextureLab } from "./WoodTextureLab";
import { page, woodTextures } from "./content";

describe("WoodTextureLab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows four horizontal-grain wood swatches with marks", () => {
    render(<WoodTextureLab />);

    expect(screen.getByText(page.grainNote)).toBeTruthy();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(woodTextures.length);

    for (const texture of woodTextures) {
      const card = cards.find((entry) =>
        within(entry).queryByRole("heading", { name: texture.name }),
      );
      expect(card).toBeTruthy();
      for (const mark of texture.marks) {
        expect(within(card!).getByText(mark)).toBeTruthy();
      }
    }
  });
});
