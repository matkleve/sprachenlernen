import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { APP_VERSION_LABEL } from "@/lib/pride-version";

import { AppVersionLabel } from "./AppVersionLabel";
import { copy } from "./content";

describe("SPEC-feature-app-update", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the version label when the deployed version matches the bundle", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.3.0" }),
    } as Response);

    render(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(APP_VERSION_LABEL)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: copy.appUpdate.reloadAria("v0.4.0", APP_VERSION_LABEL),
      }),
    ).toBeNull();
  });

  it("shows the deployed version in success styling when an update is available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.4.0" }),
    } as Response);

    const { container } = render(<AppVersionLabel />);

    const control = await screen.findByRole("button", {
      name: copy.appUpdate.reloadAria("v0.4.0", APP_VERSION_LABEL),
    });

    expect(control).toBeDefined();
    expect(screen.getByText("v0.4.0")).toBeDefined();
    expect(screen.queryByText(APP_VERSION_LABEL)).toBeNull();
    expect(container.querySelector(".text-success")).not.toBeNull();
  });

  it("reloads the page when the stale version control is tapped", async () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.4.0" }),
    } as Response);

    const user = userEvent.setup();
    render(<AppVersionLabel />);

    await user.click(
      await screen.findByRole("button", {
        name: copy.appUpdate.reloadAria("v0.4.0", APP_VERSION_LABEL),
      }),
    );

    expect(reload).toHaveBeenCalledOnce();
  });

  it("keeps the version label when the version check fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));

    render(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(APP_VERSION_LABEL)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: copy.appUpdate.reloadAria("v0.4.0", APP_VERSION_LABEL),
      }),
    ).toBeNull();
  });
});
