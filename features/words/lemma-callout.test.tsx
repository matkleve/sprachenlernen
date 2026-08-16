import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen, within} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LemmaCallout } from "@/features/words/LemmaCallout";

describe("LemmaCallout", () => {
  it("renders a collapsible disclosure for mobile and static aside for desktop", async () => {
    render(await LemmaCallout());

    expect(screen.getAllByLabelText(en.words.lemmaCalloutTitle)).toHaveLength(2);
    expect(screen.getAllByText(en.words.lemmaCalloutBody)).toHaveLength(2);
    expect(screen.getByRole("group", { name: en.words.lemmaCalloutTitle })).toBeDefined();
  });

  it("expands the mobile disclosure when the summary is tapped", async () => {
    const user = userEvent.setup();
    render(await LemmaCallout());

    const mobile = screen.getByRole("group", { name: en.words.lemmaCalloutTitle });
    expect(mobile.hasAttribute("open")).toBe(false);

    await user.click(within(mobile).getByText(en.words.lemmaCalloutTitle));

    expect(mobile.hasAttribute("open")).toBe(true);
  });
});
