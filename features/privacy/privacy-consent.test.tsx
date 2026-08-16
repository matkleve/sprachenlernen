import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CookieConsent } from "./CookieConsent";

describe("CookieConsent", () => {
  it("shows until a choice is made", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();
    render(<CookieConsent />);

    expect(screen.getByRole("dialog")).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.privacy.acceptAll }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
