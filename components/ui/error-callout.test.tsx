import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { ErrorCallout } from "./ErrorCallout";
import { copy } from "./error-callout-content";

describe("SPEC-component-error-callout", () => {
  it("shows the user message, next step, and reference id", () => {
    render(
      <ErrorCallout
        userMessage="Could not load the method catalogue."
        nextStep="Refresh the page."
        referenceId="abcd1234"
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Could not load the method catalogue.",
    );
    expect(screen.getByRole("alert").textContent).toContain("Refresh the page.");
    expect(screen.getByRole("alert").textContent).toContain("Reference: abcd1234");
    expect(screen.getByText(copy.referenceHint)).toBeDefined();
  });

  it("omits the next-step line when none is provided", () => {
    render(
      <ErrorCallout userMessage="Could not confirm your email." referenceId="abcd1234" />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toContain("Refresh the page.");
  });

  it("keeps developer fields out of the headline and shows them in technical details", async () => {
    const user = userEvent.setup();
    render(
      <ErrorCallout
        userMessage="Could not sign you in."
        referenceId="abcd1234"
        code="auth/invalid-credentials"
        developerMessage="Invalid login credentials"
      />,
    );

    const headline = screen.getByText("Could not sign you in.");
    expect(headline.textContent).toBe("Could not sign you in.");
    await user.click(screen.getByText(copy.technicalDetails));
    expect(screen.getByText(/auth\/invalid-credentials/)).toBeDefined();
    expect(screen.getByText("Invalid login credentials")).toBeDefined();
  });

  it("copies the full error report when Copy details is activated", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(
      <ErrorCallout
        userMessage="Could not load your profile."
        nextStep="Try again."
        referenceId="abcd1234"
        code="render/boundary"
        developerMessage="digest-1"
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.copyDetails }));

    expect(writeText).toHaveBeenCalledWith(
      "Could not load your profile.\nTry again.\nReference: abcd1234\nCode: render/boundary\nDeveloper: digest-1",
    );
    expect(screen.getByRole("button", { name: copy.copied })).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("delegates retry to the parent", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorCallout
        userMessage="Could not send your answer."
        referenceId="abcd1234"
        retry={<button type="button" onClick={onRetry}>Try again</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("has no axe-core violations", async () => {
    const { container } = render(
      <ErrorCallout
        userMessage="Could not load the method catalogue."
        nextStep="Refresh the page."
        referenceId="abcd1234"
        code="catalogue/load-failed"
        developerMessage="bad json"
      />,
    );
    await expectNoA11yViolations(container);
  });
});
