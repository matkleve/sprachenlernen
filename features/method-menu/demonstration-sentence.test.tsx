import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DemonstrationSentence } from "./DemonstrationSentence";
import { copy } from "./content";

const pick = {
  id: "es-hoy-quiero-ir",
  text: "Hoy quiero ir.",
  tokens: ["Hoy", "quiero", "ir."],
  heldCount: 1,
  lemmaCount: 3,
};

describe("DemonstrationSentence", () => {
  it("confirms a clean read without level claims", async () => {
    const user = userEvent.setup();
    render(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: copy.demonstrationConfirm }));

    expect(screen.getByText(copy.demonstrationReadClean)).toBeDefined();
    expect(screen.queryByText(/B1/i)).toBeNull();
  });

  it("reports marked word count on confirm", async () => {
    const user = userEvent.setup();
    render(<DemonstrationSentence pick={pick} />);

    await user.click(screen.getByRole("button", { name: "quiero" }));
    await user.click(screen.getByRole("button", { name: copy.demonstrationConfirm }));

    expect(screen.getByText(copy.demonstrationMarked(1))).toBeDefined();
  });
});
