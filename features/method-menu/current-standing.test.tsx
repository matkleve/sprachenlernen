import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { CurrentStanding } from "./CurrentStanding";

describe("CurrentStanding", () => {
  it("shows empty state with link to review when nothing is recorded", () => {
    render(<CurrentStanding summary={{ kind: "empty" }} />);

    expect(screen.getByText(en.methodMenu.standingEmpty)).toBeDefined();
    expect(screen.getByRole("link", { name: en.methodMenu.standingStartReview })).toBeDefined();
  });

  it("shows pool-local held count and link to progress when recorded", () => {
    render(<CurrentStanding summary={{ kind: "recorded", held: 12, poolSize: 50 }} />);

    expect(screen.getByText(formatMessage(en.methodMenu.standingRecorded, { held: 12, poolSize: 50 }))).toBeDefined();
    expect(screen.getByRole("link", { name: en.methodMenu.standingSeeProgress })).toBeDefined();
    expect(screen.getByText(formatMessage(en.methodMenu.standingRecorded, { held: 12, poolSize: 50 })).textContent).not.toMatch(/\bA[12]\b/);
  });
});
