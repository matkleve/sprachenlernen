import { renderWithIntl as render, renderWithIntlDe, formatMessage, en, de } from "@/tests/i18n-test-utils";
import {screen, waitFor} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileAppSection } from "@/features/profile/ProfileAppSection";
import { ProfileHomeScreenSection } from "@/features/profile/ProfileHomeScreenSection";
import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileDevSection } from "@/features/profile/ProfileDevSection";
import { devPagesSortedByLatest } from "@/lib/dev-pages";
import { routes } from "@/lib/routes";
import { ProfileSectionNav } from "@/features/profile/ProfileSectionNav";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
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
    const activeChip = screen.getByText(en.profile.active);
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

    expect(screen.getAllByRole("button", { name: en.profile.makeActive })).toHaveLength(1);
  });

  it("routes to the picker instead of rendering an empty table", () => {
    // A learner who has not chosen is not a learner with zero languages, and
    // the difference between those two is a route.
    render(<ProfileLanguages outcome={{ status: "ok", languages: [] }} />);

    expect(screen.getByText(en.profile.noneYet)).toBeDefined();
    expect(screen.getByRole("link", { name: en.profile.chooseFirst })).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("tells the learner when a switch failed rather than repainting silently", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchFailed
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe(en.profile.switchError);
  });

  it("renders its own failure so the rest of the page survives", () => {
    render(
      <ProfileLanguages outcome={{ status: "error", error: "boom" }} />,
    );

    expect(screen.getByRole("alert").textContent).toBe(en.profile.languagesError);
  });

  it("shows a standing line with a link to progress when holdings exist", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        holdings={{ es: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: 347 } }}
      />,
    );

    expect(screen.getByText(formatMessage(en.profile.standing, { held: 347, poolSize: SHIPPED_ES_POOL_SIZE }))).toBeDefined();
    expect(screen.getByRole("link", { name: en.profile.viewProgress })).toBeDefined();
  });

  it("shows zero held before the first review when a pool ships", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("it", true)] }}
        holdings={{ it: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: null } }}
      />,
    );

    expect(screen.getByText(formatMessage(en.profile.standing, { held: 0, poolSize: SHIPPED_ES_POOL_SIZE }))).toBeDefined();
  });

  it("hides Add a language when every shipped pool is already being learned", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true), language("it", false)] }}
      />,
    );

    expect(screen.queryByRole("link", { name: en.profile.addLanguage })).toBeNull();
  });

  it("shows Add a language when a shipped pool is not on the list yet", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
      />,
    );

    expect(screen.getByRole("link", { name: en.profile.addLanguage })).toBeDefined();
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
    const activeChip = screen.getByText(en.profile.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent");
    expect(activeChip.className).toContain("text-accent-ink");
    expect(screen.getAllByRole("button", { name: en.profile.makeActive })).toHaveLength(1);
  });

  it("renders German chrome when locale is de", () => {
    renderWithIntlDe(
      <ProfileSpokenLanguage outcome={{ status: "ok", spokenLanguage: "de" }} />,
    );

    expect(screen.getByRole("heading", { name: de.profile.spokenHeading })).toBeDefined();
    expect(screen.getByText(de.profile.active)).toBeDefined();
    expect(screen.getAllByRole("button", { name: de.profile.makeActive })).toHaveLength(1);
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
      json: async () => ({ version: bundledVersion, builtAt: "2026-08-19T18:42:00.000Z" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    expect(screen.getByRole("heading", { name: en.profile.appHeading })).toBeDefined();
    expect(screen.getByText(en.profile.runningVersion)).toBeDefined();
    expect(screen.getByText(en.profile.versionFrom)).toBeDefined();
    expect(screen.getByText(en.profile.lastChecked)).toBeDefined();
    expect(screen.getAllByText(APP_VERSION_LABEL).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: en.profile.checkForUpdates })).toBeDefined();
  });

  it("shows last checked after a successful version fetch", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: bundledVersion, builtAt: "2026-08-19T18:42:00.000Z" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await waitFor(() => {
      const row = screen.getByText(en.profile.lastChecked).closest("div");
      const value = row?.querySelector("dd");
      expect(value?.textContent).toBeTruthy();
      expect(value?.textContent).not.toBe(en.profile.lastCheckedPending);
    });
  });

  it("shows a green reload row when a newer version is available", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: deployedVersion, builtAt: "2026-08-20T10:00:00.000Z" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await waitFor(() => {
      expect(screen.getByText(formatMessage(en.profile.updateAvailable, { version: deployedLabel }))).toBeDefined();
    });
    expect(
      screen.getByRole("button", {
        name: formatMessage(en.profile.reloadAria, { nextVersion: deployedLabel, currentVersion: APP_VERSION_LABEL }),
      }),
    ).toBeDefined();
  });

  it("re-checks when Check for updates is tapped", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: bundledVersion, builtAt: "2026-08-19T18:42:00.000Z" }),
    } as Response);

    renderWithAppUpdate(<ProfileAppSection />);

    await user.click(screen.getByRole("button", { name: en.profile.checkForUpdates }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});

describe("ProfileHomeScreenSection", () => {
  it("shows scope table and install actions", () => {
    vi.mocked(isStandaloneDisplay).mockReturnValue(false);

    render(<ProfileHomeScreenSection />);

    expect(screen.getByRole("heading", { name: en.profile.homeScreenHeading })).toBeDefined();
    expect(screen.getByText(en.profile.homeScreenScopeHeading)).toBeDefined();
    expect(screen.getByText("/")).toBeDefined();
    expect(screen.getByRole("link", { name: en.profile.homeScreenInstallButton }).getAttribute("href")).toBe(
      "/install",
    );
    expect(screen.getByRole("link", { name: en.profile.homeScreenMainSiteButton }).getAttribute("href")).toBe(
      "/",
    );
  });

  it("shows status when opened from Home Screen icon", async () => {
    vi.mocked(isStandaloneDisplay).mockReturnValue(true);

    render(<ProfileHomeScreenSection />);

    expect(await screen.findByText(en.profile.homeScreenActive)).toBeDefined();
  });
});

describe("ProfileSectionNav", () => {
  const renderNav = (initialSection?: "languages" | "data" | "device" | "dev") => {
    const active = initialSection ?? "languages";
    document.body.innerHTML = `
      <div id="${profilePanelId("languages")}"${active === "languages" ? "" : " hidden"}>Languages panel</div>
      <div id="${profilePanelId("data")}"${active === "data" ? "" : " hidden"}>Data panel</div>
      <div id="${profilePanelId("device")}"${active === "device" ? "" : " hidden"}>Device panel</div>
      <div id="${profilePanelId("dev")}"${active === "dev" ? "" : " hidden"}>Dev panel</div>
    `;
    return render(<ProfileSectionNav initialSection={initialSection} />);
  };

  it("shows section pills with Languages active by default", () => {
    renderNav();

    expect(screen.getByRole("navigation", { name: en.profile.sectionsNavLabel })).toBeDefined();
    expect(screen.getByRole("button", { name: en.profile.sectionLanguages, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(true);
    expect(screen.getByRole("button", { name: en.profile.sectionDev })).toBeDefined();
  });

  it("switches panels instantly when a pill is tapped", async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole("button", { name: en.profile.sectionData }));

    expect(screen.getByRole("button", { name: en.profile.sectionData, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(true);
  });

  it("opens on the requested section when initialSection is data", () => {
    renderNav("data");

    expect(screen.getByRole("button", { name: en.profile.sectionData, pressed: true })).toBeDefined();
    expect(document.getElementById(profilePanelId("data"))?.hidden).toBe(false);
    expect(document.getElementById(profilePanelId("languages"))?.hidden).toBe(true);
  });
});

describe("ProfileDevSection", () => {
  /**
   * Contract: docs/specs/page/profile.md § Section navigation.
   *
   * The link targets are asserted against `routes`, not against literals: the
   * point of that file is that an address moved there is moved everywhere, and
   * a test with its own copy of "/dev/design" would quietly outlive a rename.
   */
  it("links to every dev preview page through lib/routes.ts", () => {
    render(<ProfileDevSection />);

    for (const href of [
      routes.profileDevSentenceRealizer,
      routes.woodGrainLab,
      routes.progressionExplorer,
      routes.materialExplorer,
      routes.woodTextureLab,
      routes.designExplorer,
      routes.brandExplorer,
      routes.methodCardAssets,
      routes.primitives,
      routes.safariBisect,
    ]) {
      const link = document.querySelector(`a[href="${href}"]`);
      expect(link, `expected a link to ${href}`).not.toBeNull();
    }
  });

  it("names the progression explorer, the reason this section exists", () => {
    render(<ProfileDevSection />);
    expect(screen.getByText("Progression explorer")).toBeTruthy();
  });

  it("says plainly that nothing here touches the account", () => {
    render(<ProfileDevSection />);
    expect(screen.getByText(/changes your account or your learning data/i)).toBeTruthy();
  });

  it("sorts dev links by last updated with the newest first", () => {
    render(<ProfileDevSection />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(devPagesSortedByLatest().map((page) => page.href));
  });

  it("shows last updated on every dev link card", () => {
    render(<ProfileDevSection />);
    expect(screen.getAllByText(/^Last updated /).length).toBe(10);
  });
});
