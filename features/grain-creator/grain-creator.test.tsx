/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GrainCreator } from "./GrainCreator";
import { page } from "./content";

describe("GrainCreator", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a grain preview and range controls", () => {
    render(<GrainCreator />);

    expect(screen.getByLabelText(page.previewHeading)).toBeTruthy();
    expect(screen.getByLabelText(/Deep seam opacity/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: page.copyLabel })).toBeTruthy();
  });

  it("loads the raw-planks preset with darker seams than oiled timber", () => {
    render(<GrainCreator />);

    fireEvent.click(screen.getByRole("button", { name: "Oiled timber" }));
    const oiledSeam = Number(
      (screen.getByLabelText(/Deep seam opacity/i) as HTMLInputElement).value,
    );

    fireEvent.click(screen.getByRole("button", { name: "Raw planks" }));
    const rawSeam = Number(
      (screen.getByLabelText(/Deep seam opacity/i) as HTMLInputElement).value,
    );

    expect(rawSeam).toBeGreaterThan(oiledSeam);
  });

  it("copies a CSS snippet containing both grain layers", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<GrainCreator />);
    fireEvent.click(screen.getByRole("button", { name: page.copyLabel }));

    expect(writeText).toHaveBeenCalledOnce();
    const copied = String(writeText.mock.calls[0]?.[0]);
    expect(copied).toContain("repeating-linear-gradient(90deg");
    expect(copied).toContain("feTurbulence");
  });
});
