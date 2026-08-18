import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DemonstrationSentence } from "./DemonstrationSentence";
import { copy } from "./content";

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
    render(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: copy.demonstrationFlipHint }));
    expect(screen.getByText(pick.translation)).toBeDefined();

    await user.click(screen.getByRole("button", { name: copy.demonstrationGradeEasy }));

    expect(screen.getByText(copy.demonstrationFeedbackEasy)).toBeDefined();
    expect(screen.queryByText(/B1/i)).toBeNull();
  });

  it("shows hard feedback when the read felt difficult", async () => {
    const user = userEvent.setup();
    render(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: copy.demonstrationFlipHint }));
    await user.click(screen.getByRole("button", { name: copy.demonstrationGradeHard }));

    expect(screen.getByText(copy.demonstrationFeedbackHard)).toBeDefined();
  });

  it("does not show grade buttons before the card is flipped", () => {
    render(<DemonstrationSentence pick={pick} />);

    expect(screen.queryByRole("button", { name: copy.demonstrationGradeGood })).toBeNull();
  });
});
