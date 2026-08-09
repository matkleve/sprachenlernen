import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CookieConsent } from "./CookieConsent";
import { privacyContent } from "./content";

describe("CookieConsent", () => {
  it("shows until a choice is made", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();
    render(<CookieConsent />);

    expect(screen.getByRole("dialog")).toBeDefined();
    await user.click(screen.getByRole("button", { name: privacyContent.acceptAll }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
