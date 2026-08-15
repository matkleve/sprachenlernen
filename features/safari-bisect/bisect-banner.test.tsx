import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BisectBanner } from "./BisectBanner";
import { wordsBisectLevelLabels } from "@/lib/safari-bisect";

vi.mock("./InsetReadout", () => ({
  InsetReadout: () => <div data-testid="inset-readout" />,
}));

describe("BisectBanner", () => {
  it("shows the active level and navigation links", () => {
    render(
      <BisectBanner
        basePath="/words-bisect"
        level={2}
        maxLevel={5}
        levelLabels={wordsBisectLevelLabels}
      />,
    );

    expect(screen.getByText(/Level 2\/5/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Previous level/i }).getAttribute("href")).toBe(
      "/words-bisect?level=1",
    );
    expect(screen.getByRole("link", { name: /Next level/i }).getAttribute("href")).toBe(
      "/words-bisect?level=3",
    );
    expect(screen.getByTestId("inset-readout")).toBeTruthy();
  });
});
