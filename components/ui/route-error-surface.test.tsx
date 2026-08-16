import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteErrorSurface } from "@/components/ui/RouteErrorSurface";
import { copy } from "@/components/ui/route-error-surface-content";

describe("RouteErrorSurface", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("reloads the page when Try again is clicked on a render boundary", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <RouteErrorSurface
        userMessage="Could not load your profile."
        referenceId="ref00001"
        code="render/boundary"
        developerMessage="boom"
        onRetry={onRetry}
        escape={{ href: "/methods", label: "Back to Methods" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.tryAgain }));
    expect(reload).toHaveBeenCalledOnce();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("calls onRetry for network failures", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <RouteErrorSurface
        userMessage="You appear to be offline."
        referenceId="ref00002"
        code="network/offline"
        developerMessage="Failed to fetch"
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.tryAgain }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows an escape link when provided", () => {
    render(
      <RouteErrorSurface
        userMessage="Could not load your profile."
        referenceId="ref00003"
        code="render/boundary"
        developerMessage="boom"
        onRetry={() => {}}
        escape={{ href: "/methods", label: "Back to Methods" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Back to Methods" }).getAttribute("href")).toBe(
      "/methods",
    );
  });
});
