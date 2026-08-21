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
    expect(screen.getByLabelText(/Valley depth \(opacity\)/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: page.copyLabel })).toBeTruthy();
  });

  it("loads the raw-planks preset with deeper valleys than stock bar", () => {
    render(<GrainCreator />);

    fireEvent.click(screen.getByRole("button", { name: "Stock bar" }));
    const stockValley = Number(
      (screen.getByLabelText(/Valley depth \(opacity\)/i) as HTMLInputElement).value,
    );

    fireEvent.click(screen.getByRole("button", { name: "Raw planks" }));
    const rawValley = Number(
      (screen.getByLabelText(/Valley depth \(opacity\)/i) as HTMLInputElement).value,
    );

    expect(rawValley).toBeGreaterThan(stockValley);
  });

  it("copies a CSS snippet containing horizontal valleys and fibre noise", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<GrainCreator />);
    fireEvent.click(screen.getByRole("button", { name: page.copyLabel }));

    expect(writeText).toHaveBeenCalledOnce();
    const copied = String(writeText.mock.calls[0]?.[0]);
    expect(copied).toContain("repeating-linear-gradient(180deg");
    expect(copied).toContain("feTurbulence");
  });
});
