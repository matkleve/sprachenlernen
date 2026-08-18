import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import packageJson from "@/package.json";
import {
  APP_VERSION_LABEL,
  bumpPrideVersion,
  formatPrideVersion,
  parsePrideVersion,
} from "@/lib/pride-version";
import { en, formatMessage } from "@/tests/i18n-test-utils";

import { AppUpdateChip } from "./AppUpdateChip";
import { AppVersionLabel } from "./AppVersionLabel";
import { renderWithAppUpdate } from "./test-utils";

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

    renderWithAppUpdate(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(bundledLabel)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: formatMessage(en.appShell.appUpdate.reloadAria, {
          nextVersion: deployedLabel,
          currentVersion: bundledLabel,
        }),
      }),
    ).toBeNull();
  });

  it("shows an update chip above the pill when an update is available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: deployedVersion }),
    } as Response);

    const { container } = renderWithAppUpdate(
      <>
        <AppUpdateChip />
        <AppVersionLabel />
      </>,
    );

    const control = await screen.findByRole("button", {
      name: formatMessage(en.appShell.appUpdate.reloadAria, {
        nextVersion: deployedLabel,
        currentVersion: bundledLabel,
      }),
    });

    expect(control).toBeDefined();
    expect(screen.getByText(en.appShell.appUpdate.updateAvailable)).toBeDefined();
    expect(screen.queryByText(bundledLabel)).toBeNull();
    expect(container.querySelector(".text-success")).not.toBeNull();
  });

  it("reloads the page when the stale update chip is tapped", async () => {
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
    renderWithAppUpdate(<AppUpdateChip />);

    await user.click(
      await screen.findByRole("button", {
        name: formatMessage(en.appShell.appUpdate.reloadAria, {
          nextVersion: deployedLabel,
          currentVersion: bundledLabel,
        }),
      }),
    );

    expect(reload).toHaveBeenCalledOnce();
  });

  it("keeps the version label when the version check fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));

    renderWithAppUpdate(<AppVersionLabel />);

    await waitFor(() => {
      expect(screen.getByText(bundledLabel)).toBeDefined();
    });
    expect(
      screen.queryByRole("button", {
        name: formatMessage(en.appShell.appUpdate.reloadAria, {
          nextVersion: deployedLabel,
          currentVersion: bundledLabel,
        }),
      }),
    ).toBeNull();
  });
});
