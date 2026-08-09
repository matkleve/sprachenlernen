import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { ErrorCallout } from "./ErrorCallout";

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
  });

  it("omits the next-step line when none is provided", () => {
    render(
      <ErrorCallout userMessage="Could not confirm your email." referenceId="abcd1234" />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toContain("Refresh the page.");
  });

  it("does not render developer-only fields even if a caller passes them", () => {
    render(
      <ErrorCallout
        userMessage="Could not sign you in."
        referenceId="abcd1234"
        {...({ developerMessage: "secret upstream detail" } as Record<string, string>)}
      />,
    );

    expect(screen.queryByText("secret upstream detail")).toBeNull();
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
      />,
    );
    await expectNoA11yViolations(container);
  });
});
