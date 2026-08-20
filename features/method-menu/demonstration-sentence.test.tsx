import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DemonstrationSentence } from "./DemonstrationSentence";
import { renderWithIntl, renderWithIntlDe, screen } from "@/tests/i18n-test-utils";

const pick = {
  id: "es-hoy-quiero-ir",
  text: "Hoy quiero ir.",
  translation: "Today I want to go.",
  heldCount: 1,
  lemmaCount: 3,
};

describe("DemonstrationSentence", () => {
  it("flips to the translation and grades without level claims", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: "Tap to turn" }));
    expect(screen.getByText(pick.translation)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Easy" }));

    expect(screen.getByText("You read that easily.")).toBeDefined();
    expect(screen.queryByText(/B1/i)).toBeNull();
  });

  it("shows hard feedback when the read felt difficult", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: "Tap to turn" }));
    await user.click(screen.getByRole("button", { name: "Hard" }));

    expect(screen.getByText("That one was tough — worth another look when you review.")).toBeDefined();
  });

  it("does not show grade buttons before the card is flipped", () => {
    renderWithIntl(<DemonstrationSentence pick={pick} />);

    expect(screen.queryByRole("button", { name: "Good" })).toBeNull();
  });

  it("renders German labels when locale is de", async () => {
    const user = userEvent.setup();
    renderWithIntlDe(<DemonstrationSentence pick={pick} />);

    expect(screen.getByText("Können Sie das lesen?")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Tippen zum Umdrehen" }));
    expect(screen.getByRole("button", { name: "Leicht" })).toBeDefined();
  });
});
