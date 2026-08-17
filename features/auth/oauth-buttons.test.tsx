import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OAuthButtons } from "./OAuthButtons";

/**
 * OAuth control layout — docs/specs/service/auth.md § OAuth controls.
 */

describe("OAuthButtons", () => {
  it("renders round icon buttons side by side with accessible names", async () => {
    render(await OAuthButtons());

    const google = screen.getByRole("button", { name: en.auth.oauthGoogleAria });
    const apple = screen.getByRole("button", { name: en.auth.oauthAppleAria });
    const row = google.closest("div.flex") as HTMLElement | null;

    expect(row).toBeTruthy();
    expect(within(row!).getAllByRole("button")).toHaveLength(2);
    expect(google.className.split(/\s+/)).toContain("rounded-full");
    expect(apple.className.split(/\s+/)).toContain("rounded-full");
    expect(google.textContent?.trim()).toBe("");
    expect(apple.textContent?.trim()).toBe("");
    expect(google.querySelector("svg")).toBeTruthy();
    expect(apple.querySelector("svg")).toBeTruthy();
  });
});
