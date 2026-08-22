/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WOOD_TUNED_VARIANT_COUNT } from "@/lib/wood-grain-ridges";

import { WoodTextureLab } from "./WoodTextureLab";
import { page, woodTextures } from "./content";

describe("WoodTextureLab", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows ten tuned variants and four board swatches", () => {
    render(<WoodTextureLab />);

    expect(screen.getByText(page.grainNote)).toBeTruthy();
    expect(page.tunedVariants.length).toBe(WOOD_TUNED_VARIANT_COUNT);

    const tunedCards = screen.getAllByRole("heading", { level: 3 });
    expect(tunedCards).toHaveLength(WOOD_TUNED_VARIANT_COUNT);

    for (const variant of page.tunedVariants) {
      expect(screen.getByRole("heading", { name: variant.name })).toBeTruthy();
      expect(screen.getByText(variant.note)).toBeTruthy();
    }

    const boardCards = screen.getAllByRole("article");
    expect(boardCards.length).toBe(WOOD_TUNED_VARIANT_COUNT + woodTextures.length);

    for (const texture of woodTextures) {
      expect(screen.getByRole("heading", { name: texture.name, level: 2 })).toBeTruthy();
      const card = boardCards.find((entry) =>
        within(entry).queryByRole("heading", { name: texture.name, level: 2 }),
      );
      expect(card).toBeTruthy();
      expect(card!.querySelector("canvas")).toBeTruthy();
      for (const mark of texture.marks) {
        expect(within(card!).getByText(mark)).toBeTruthy();
      }
    }
  });
});
