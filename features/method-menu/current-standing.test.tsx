import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CurrentStanding } from "./CurrentStanding";
import { copy } from "./content";

describe("CurrentStanding", () => {
  it("shows empty state with link to review when nothing is recorded", () => {
    render(<CurrentStanding summary={{ kind: "empty" }} />);

    expect(screen.getByText(copy.standingEmpty)).toBeDefined();
    expect(screen.getByRole("link", { name: copy.standingStartReview })).toBeDefined();
  });

  it("shows pool-local held count and link to progress when recorded", () => {
    render(<CurrentStanding summary={{ kind: "recorded", held: 12, poolSize: 50 }} />);

    expect(screen.getByText(copy.standingRecorded(12, 50))).toBeDefined();
    expect(screen.getByRole("link", { name: copy.standingSeeProgress })).toBeDefined();
    expect(screen.getByText(copy.standingRecorded(12, 50)).textContent).not.toMatch(/\bA[12]\b/);
  });
});
