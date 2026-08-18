import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";

import { LandingMethodPreview } from "./LandingMethodPreview";

const { catalogue } = loadMethodCatalogue();

describe("LandingMethodPreview", () => {
  it("shows three methods and opens an explain-only dialog without start", async () => {
    if (!catalogue) throw new Error("catalogue missing");

    const user = userEvent.setup();
    render(
      <LandingMethodPreview catalogue={catalogue} dayKey="2026-08-18" />,
    );

    const methodList = screen.getByLabelText(en.marketing.landing.methodPreview.methodsLabel);
    const cards = within(methodList).getAllByRole("button");
    expect(cards.length).toBe(3);

    await user.click(cards[0]!);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.queryByRole("link", { name: /start/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /start/i })).toBeNull();
  });

  it("shows basic filters without refine panel", () => {
    if (!catalogue) throw new Error("catalogue missing");

    render(<LandingMethodPreview catalogue={catalogue} dayKey="2026-08-18" />);

    expect(screen.getByText(en.methodMenu.timeLabel)).toBeTruthy();
    expect(screen.getByText(en.methodMenu.skillLabel)).toBeTruthy();
    expect(screen.getByText(en.methodMenu.energyLabel)).toBeTruthy();
    expect(screen.queryByText(en.methodMenu.refineLabel)).toBeNull();
  });

  it("shows preview note copy", () => {
    if (!catalogue) throw new Error("catalogue missing");

    render(<LandingMethodPreview catalogue={catalogue} dayKey="2026-08-18" />);

    expect(screen.getByText(en.marketing.landing.methodPreview.previewNote)).toBeTruthy();
  });
});
