import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReviewOpen } from "./ReviewOpen";
import { copy } from "./content";

describe("ReviewOpen", () => {
  it("shows grade buttons and responds to a tap", async () => {
    const user = userEvent.setup();
    render(<ReviewOpen methodName="SRS session" />);

    await user.click(screen.getByRole("button", { name: copy.good }));
    expect(screen.getByText(copy.graded)).toBeDefined();
  });
});
