import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import packageJson from "@/package.json";
import {
  APP_VERSION_LABEL,
  bumpPrideVersion,
  formatPrideVersion,
  parsePrideVersion,
} from "@/lib/pride-version";

import { AppVersionLabel } from "./AppVersionLabel";
import { copy } from "./content";

const bundledVersion = packageJson.version;
const bundledLabel = APP_VERSION_LABEL;
const deployedVersion = formatPrideVersion(
  bumpPrideVersion(parsePrideVersion(bundledVersion), "default"),
);
const deployedLabel = `v${deployedVersion}`;

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
      json: async () => ({ version: bundledVersion }),
    } as Response);

    render(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(bundledLabel)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: copy.appUpdate.reloadAria(deployedLabel, bundledLabel),
      }),
    ).toBeNull();
  });

  it("shows the deployed version in success styling when an update is available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: deployedVersion }),
    } as Response);

    const { container } = render(<AppVersionLabel />);

    const control = await screen.findByRole("button", {
      name: copy.appUpdate.reloadAria(deployedLabel, bundledLabel),
    });

    expect(control).toBeDefined();
    expect(screen.getByText(deployedLabel)).toBeDefined();
    expect(screen.queryByText(bundledLabel)).toBeNull();
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
      json: async () => ({ version: deployedVersion }),
    } as Response);

    const user = userEvent.setup();
    render(<AppVersionLabel />);

    await user.click(
      await screen.findByRole("button", {
        name: copy.appUpdate.reloadAria(deployedLabel, bundledLabel),
      }),
    );

    expect(reload).toHaveBeenCalledOnce();
  });

  it("keeps the version label when the version check fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));

    render(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(bundledLabel)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: copy.appUpdate.reloadAria(deployedLabel, bundledLabel),
      }),
    ).toBeNull();
  });
});
