import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import { copy } from "@/components/ui/route-error-surface-content";

describe("RouteErrorSurface", () => {
  it("shows actionable copy and a reference id", () => {
    render(
      <RouteErrorSurface
        userMessage="Could not start your review session."
        nextStep="Try again in a moment."
        referenceId="abc12345"
        code="render/boundary"
        developerMessage="stack trace"
        onRetry={() => {}}
      />,
    );

    expect(screen.getByText("Could not start your review session.")).toBeDefined();
    expect(screen.getByText("Try again in a moment.")).toBeDefined();
    expect(screen.getByText(/abc12345/)).toBeDefined();
    expect(screen.queryByText(/something went wrong/i)).toBeNull();
  });

  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <RouteErrorSurface
        userMessage="Could not load your vocabulary."
        referenceId="ref00001"
        code="render/boundary"
        developerMessage="boom"
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.tryAgain }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
