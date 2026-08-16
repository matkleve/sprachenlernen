import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileHomeScreenSection } from "@/features/profile/ProfileHomeScreenSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSectionNav } from "@/features/profile/ProfileSectionNav";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
import { copy } from "@/features/profile/content";
import { profilePanelId } from "@/lib/profile-section";
import { renderWithAppUpdate } from "@/features/app-shell/test-utils";
import packageJson from "@/package.json";
import { isStandaloneDisplay } from "@/lib/is-standalone-display";
import {
  APP_VERSION_LABEL,
  bumpPrideVersion,
  formatPrideVersion,
  parsePrideVersion,
} from "@/lib/pride-version";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

const bundledVersion = packageJson.version;
const deployedVersion = formatPrideVersion(
  bumpPrideVersion(parsePrideVersion(bundledVersion), "default"),
);
const deployedLabel = `v${deployedVersion}`;

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/profile"),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

vi.mock("@/lib/is-standalone-display", () => ({
  isStandaloneDisplay: vi.fn(() => false),
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
      json: async () => ({ version: bundledVersion }),
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
      json: async () => ({ version: deployedVersion }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await waitFor(() => {
      expect(screen.getByText(copy.updateAvailable(deployedLabel))).toBeDefined();
    });
    expect(
      screen.getByRole("button", {
        name: copy.reloadAria(deployedLabel, APP_VERSION_LABEL),
      }),
    ).toBeDefined();
  });

  it("re-checks when Check for updates is tapped", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: bundledVersion }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await user.click(screen.getByRole("button", { name: copy.checkForUpdates }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});

describe("ProfileHomeScreenSection", () => {
  it("shows scope table and install actions", () => {
    vi.mocked(isStandaloneDisplay).mockReturnValue(false);

    render(<ProfileHomeScreenSection />);

    expect(screen.getByRole("heading", { name: copy.homeScreenHeading })).toBeDefined();
    expect(screen.getByText(copy.homeScreenScopeHeading)).toBeDefined();
    expect(screen.getByText("/")).toBeDefined();
    expect(screen.getByRole("link", { name: copy.homeScreenInstallButton }).getAttribute("href")).toBe(
      "/install",
    );
    expect(screen.getByRole("link", { name: copy.homeScreenMainSiteButton }).getAttribute("href")).toBe(
      "/",
    );
  });

  it("shows status when opened from Home Screen icon", async () => {
    vi.mocked(isStandaloneDisplay).mockReturnValue(true);

    render(<ProfileHomeScreenSection />);

    expect(await screen.findByText(copy.homeScreenActive)).toBeDefined();
  });
});

describe("ProfileSectionNav", () => {
  const renderNav = (initialSection?: "languages" | "data" | "device") => {
    const active = initialSection ?? "languages";
    document.body.innerHTML = `
      <div id="${profilePanelId("languages")}"${active === "languages" ? "" : " hidden"}>Languages panel</div>
      <div id="${profilePanelId("data")}"${active === "data" ? "" : " hidden"}>Data panel</div>
      <div id="${profilePanelId("device")}"${active === "device" ? "" : " hidden"}>Device panel</div>
    `;
    return render(<ProfileSectionNav initialSection={initialSection} />);
  };

  it("shows section pills with Languages active by default", () => {
    renderNav();

    expect(screen.getByRole("navigation", { name: copy.sectionsNavLabel })).toBeDefined();
    expect(screen.getByRole("button", { name: copy.sectionLanguages, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(true);
  });

  it("switches panels instantly when a pill is tapped", async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole("button", { name: copy.sectionData }));

    expect(screen.getByRole("button", { name: copy.sectionData, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(true);
  });

  it("opens on the requested section when initialSection is data", () => {
    renderNav("data");

    expect(screen.getByRole("button", { name: copy.sectionData, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(true);
  });
});
