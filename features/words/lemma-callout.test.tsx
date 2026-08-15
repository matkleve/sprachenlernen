import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { copy } from "@/features/words/content";
import { LemmaCallout } from "@/features/words/LemmaCallout";

describe("LemmaCallout", () => {
  it("renders a collapsible disclosure for mobile and static aside for desktop", () => {
    render(<LemmaCallout />);

    expect(screen.getAllByLabelText(copy.lemmaCalloutTitle)).toHaveLength(2);
    expect(screen.getAllByText(copy.lemmaCalloutBody)).toHaveLength(2);
    expect(screen.getByRole("group", { name: copy.lemmaCalloutTitle })).toBeDefined();
  });

  it("expands the mobile disclosure when the summary is tapped", async () => {
    const user = userEvent.setup();
    render(<LemmaCallout />);

    const mobile = screen.getByRole("group", { name: copy.lemmaCalloutTitle });
    expect(mobile.hasAttribute("open")).toBe(false);

    await user.click(within(mobile).getByText(copy.lemmaCalloutTitle));

    expect(mobile.hasAttribute("open")).toBe(true);
  });
});
