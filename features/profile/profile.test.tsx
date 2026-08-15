import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
import { copy } from "@/features/profile/content";
import { renderWithAppUpdate } from "@/features/app-shell/test-utils";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/profile"),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

/** Contract: docs/specs/page/profile.md */

const language = (code: string, isActive: boolean) => ({
  languageCode: code,
  isActive,
  addedAt: "2026-08-11T10:00:00.000Z",
});

describe("ProfileLanguages", () => {
  it("shows the language with its endonym and marks the one in focus", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
      />,
    );

    expect(screen.getByText("Español")).toBeDefined();
    expect(screen.getByText("Spanish")).toBeDefined();
    const activeChip = screen.getByText(copy.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent");
    expect(activeChip.className).toContain("text-accent-ink");
  });

  it("offers a switch on a language that is not in focus", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true), language("it", false)] }}
      />,
    );

    expect(screen.getAllByRole("button", { name: copy.makeActive })).toHaveLength(1);
  });

  it("routes to the picker instead of rendering an empty table", () => {
    // A learner who has not chosen is not a learner with zero languages, and
    // the difference between those two is a route.
    render(<ProfileLanguages outcome={{ status: "ok", languages: [] }} />);

    expect(screen.getByText(copy.noneYet)).toBeDefined();
    expect(screen.getByRole("link", { name: copy.chooseFirst })).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("tells the learner when a switch failed rather than repainting silently", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchFailed
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe(copy.switchError);
  });

  it("renders its own failure so the rest of the page survives", () => {
    render(
      <ProfileLanguages outcome={{ status: "error", error: "boom" }} />,
    );

    expect(screen.getByRole("alert").textContent).toBe(copy.languagesError);
  });

  it("shows a standing line with a link to progress when holdings exist", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        holdings={{ es: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: 347 } }}
      />,
    );

    expect(screen.getByText(copy.standing(347, SHIPPED_ES_POOL_SIZE))).toBeDefined();
    expect(screen.getByRole("link", { name: copy.viewProgress })).toBeDefined();
  });

  it("shows zero held before the first review when a pool ships", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("it", true)] }}
        holdings={{ it: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: null } }}
      />,
    );

    expect(screen.getByText(copy.standing(0, SHIPPED_ES_POOL_SIZE))).toBeDefined();
  });

  it("hides Add a language when every shipped pool is already being learned", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true), language("it", false)] }}
      />,
    );

    expect(screen.queryByRole("link", { name: copy.addLanguage })).toBeNull();
  });

  it("shows Add a language when a shipped pool is not on the list yet", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
      />,
    );

    expect(screen.getByRole("link", { name: copy.addLanguage })).toBeDefined();
  });

  it("shows no streak, XP, or review total", () => {
    const { container } = render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
      />,
    );
    const text = (container.textContent ?? "").toLowerCase();

    expect(text).not.toMatch(/streak|xp|day in a row|cards reviewed/);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});

describe("ProfileSpokenLanguage", () => {
  it("marks the current spoken language and offers a switch for the other", () => {
    render(
      <ProfileSpokenLanguage outcome={{ status: "ok", spokenLanguage: "en" }} />,
    );

    expect(screen.getByText("Deutsch")).toBeDefined();
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    const activeChip = screen.getByText(copy.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent");
    expect(activeChip.className).toContain("text-accent-ink");
    expect(screen.getAllByRole("button", { name: copy.makeActive })).toHaveLength(1);
  });
});

describe("ProfileAppSection", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the running version and a check-for-updates control", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.3.0" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    expect(screen.getByRole("heading", { name: copy.appHeading })).toBeDefined();
    expect(screen.getByText(copy.runningVersion)).toBeDefined();
    expect(screen.getAllByText(APP_VERSION_LABEL).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: copy.checkForUpdates })).toBeDefined();
  });

  it("shows a green reload row when a newer version is available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.4.0" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await waitFor(() => {
      expect(screen.getByText(copy.updateAvailable("v0.4.0"))).toBeDefined();
    });
    expect(
      screen.getByRole("button", {
        name: copy.reloadAria("v0.4.0", APP_VERSION_LABEL),
      }),
    ).toBeDefined();
  });

  it("re-checks when Check for updates is tapped", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: "0.3.0" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await user.click(screen.getByRole("button", { name: copy.checkForUpdates }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
