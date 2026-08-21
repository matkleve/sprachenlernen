/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GrainCreator } from "./GrainCreator";
import { page } from "./content";

describe("GrainCreator", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows match panel controls and terrain sliders", () => {
    render(<GrainCreator />);

    expect(screen.getByText(page.referenceHeading)).toBeTruthy();
    expect(screen.getByRole("button", { name: page.analyzeReference })).toBeTruthy();
    expect(screen.getByRole("button", { name: page.autoFit })).toBeTruthy();
    expect(screen.getByLabelText(/Valley abruptness \(gamma\)/i)).toBeTruthy();
  });

  it("offers overlay and diff view modes", () => {
    render(<GrainCreator />);
    expect(screen.getByRole("button", { name: page.viewOverlay })).toBeTruthy();
    expect(screen.getByRole("button", { name: page.viewDiff })).toBeTruthy();
  });

  it("copies procedural noise CSS without stripe gradients", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<GrainCreator />);
    fireEvent.click(screen.getByRole("button", { name: page.copyLabel }));

    expect(writeText).toHaveBeenCalledOnce();
    const copied = String(writeText.mock.calls[0]?.[0]);
    expect(copied).toContain("feTurbulence");
    expect(copied).not.toContain("repeating-linear-gradient");
  });
});
