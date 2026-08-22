import { renderWithIntl as render, en, formatMessage } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignUpForm } from "./SignUpForm";

/**
 * The "check your email" screen — docs/specs/service/auth.md Behaviors 10–11.
 * Covers: the submitted address is shown and reused as a field default and an
 * action input (never as freeform text), resend stays on the same address, and
 * "wrong address" returns to a prefilled signup form.
 *
 * OAuthButtons is its own async Server Component with its own test
 * (oauth-buttons.test.tsx) — client-side React cannot render an async
 * component synchronously, so it is stubbed here rather than exercised again.
 */
vi.mock("@/features/auth/OAuthButtons", () => ({ OAuthButtons: () => null }));

describe("SignUpForm", () => {
  it("shows the submitted address and offers resend, not a dead end", async () => {
    render(await SignUpForm({ sent: true, email: "a@example.com" }));

    expect(
      screen.getByText(formatMessage(en.auth.signUp.confirmationSent, { email: "a@example.com" })),
    ).toBeTruthy();

    const resend = screen.getByRole("button", { name: en.auth.signUp.resendSubmit });
    const form = resend.closest("form");
    expect(form?.getAttribute("action")).toBeTruthy();
    const hiddenEmail = form?.querySelector('input[name="email"]') as HTMLInputElement | null;
    expect(hiddenEmail?.value).toBe("a@example.com");
  });

  it("confirms a resend without implying a second, different email was sent", async () => {
    render(await SignUpForm({ sent: true, resent: true, email: "a@example.com" }));

    expect(
      screen.getByText(formatMessage(en.auth.signUp.confirmationResent, { email: "a@example.com" })),
    ).toBeTruthy();
  });

  it("links back to a prefilled signup form for a mistyped address", async () => {
    render(await SignUpForm({ sent: true, email: "a@exampel.com" }));

    const fixIt = screen.getByRole("link", { name: en.auth.signUp.wrongEmailLink });
    expect(fixIt.getAttribute("href")).toBe("/signup?email=a%40exampel.com");
  });

  it("prefills the email field when returning from a corrected-address link", async () => {
    render(await SignUpForm({ email: "a@exampel.com" }));

    const emailField = screen.getByLabelText(en.auth.emailLabel) as HTMLInputElement;
    expect(emailField.value).toBe("a@exampel.com");
  });
});
