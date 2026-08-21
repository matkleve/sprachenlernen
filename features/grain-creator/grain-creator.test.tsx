/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GrainCreator } from "./GrainCreator";
import { page } from "./content";

describe("GrainCreator", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows reference and generated panels with terrain controls", () => {
    render(<GrainCreator />);

    expect(screen.getByText(page.referenceHeading)).toBeTruthy();
    expect(screen.getByText(page.generatedHeading)).toBeTruthy();
    expect(screen.getByLabelText(/Valley abruptness \(gamma\)/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: page.copyLabel })).toBeTruthy();
  });

  it("loads raw planks with deeper macro contrast than stock bar", () => {
    render(<GrainCreator />);

    fireEvent.click(screen.getByRole("button", { name: "Stock bar" }));
    const stockContrast = Number(
      (screen.getByLabelText(/Valley depth \(contrast\)/i) as HTMLInputElement).value,
    );

    fireEvent.click(screen.getByRole("button", { name: "Raw planks" }));
    const rawContrast = Number(
      (screen.getByLabelText(/Valley depth \(contrast\)/i) as HTMLInputElement).value,
    );

    expect(rawContrast).toBeGreaterThan(stockContrast);
  });

  it("copies a CSS snippet with stretch sizing and procedural noise", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<GrainCreator />);
    fireEvent.click(screen.getByRole("button", { name: page.copyLabel }));

    expect(writeText).toHaveBeenCalledOnce();
    const copied = String(writeText.mock.calls[0]?.[0]);
    expect(copied).toContain("feTurbulence");
    expect(copied).toContain("background-repeat: no-repeat");
    expect(copied).not.toContain("repeating-linear-gradient");
  });
});
