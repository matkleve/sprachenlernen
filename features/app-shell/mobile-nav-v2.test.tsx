import type { ReactElement } from "react";
import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { AppUpdateProvider } from "./AppUpdateProvider";
import { AppShell } from "./AppShell";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import packageJson from "@/package.json";


const oneLanguage = [{ code: "es", endonym: "Español", isActive: true }] as const;
const twoLanguages = [
  { code: "es", endonym: "Español", isActive: true },
  { code: "it", endonym: "Italiano", isActive: false },
] as const;

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

function mockMobileViewport() {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  );
}

beforeEach(() => {
  mockMobileViewport();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: packageJson.version }),
    } as Response),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderChrome(ui: ReactElement) {
  return render(<AppUpdateProvider>{ui}</AppUpdateProvider>);
}

describe("SPEC-feature-mobile-nav-v2", () => {
  it("shows pill destinations without a hamburger", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    const { container } = renderChrome(<FloatingShellChrome languages={oneLanguage} />);

    expect(screen.queryByRole("button", { name: /menu/i })).toBeNull();
    expect(container.querySelector(".footer-scrim-blur")).not.toBeNull();
    expect(container.querySelector(".shell-float-footer-scrim")).not.toBeNull();
    expect(container.querySelector(".shell-float-nav-pill")).not.toBeNull();
    expect(container.querySelector(".pointer-events-auto.absolute.inset-0")).not.toBeNull();

    const nav = screen.getByRole("navigation", { name: en.appShell.mobileNavLabel });
    const links = nav.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(3);
    expect(nav.querySelector("ul")?.className).toContain("inline-flex");
    expect(screen.getByRole("link", { name: en.appShell.destinations.methods })).toBeDefined();
    expect(screen.getByRole("link", { name: en.appShell.destinations.words })).toBeDefined();
    expect(screen.getByRole("link", { name: en.appShell.destinations.progress })).toBeDefined();
    for (const link of links) {
      expect(link.textContent?.trim()).toBe("");
    }
    expect(screen.getByText(APP_VERSION_LABEL)).toBeDefined();
  });

  it("shows the account icon chip and one Words link on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    renderChrome(<FloatingShellChrome languages={oneLanguage} />);

    const account = screen.getByRole("link", { name: en.appShell.account });
    expect(account.getAttribute("href")).toBe("/profile");
    expect(account.getAttribute("aria-current")).toBeNull();
    expect(account.textContent?.trim()).toBe("");
    expect(screen.queryByRole("button", { name: en.profile.signOut })).toBeNull();
    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: en.appShell.holding.words.title })).toBeDefined();
  });

  it("marks the account icon chip as current on /profile", () => {
    vi.mocked(usePathname).mockReturnValue("/profile");
    renderChrome(<FloatingShellChrome languages={oneLanguage} />);

    const account = screen.getByRole("link", { name: en.appShell.account });
    expect(account.getAttribute("aria-current")).toBe("page");
    expect(account.className).toContain("bg-accent");
  });

  it("shows the language emoji on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    renderChrome(<FloatingShellChrome languages={twoLanguages} />);

    expect(screen.getByRole("button", { name: en.appShell.switchLanguage })).toBeDefined();
    expect(screen.getByText("🇪🇸")).toBeDefined();
  });

  it("shows icon-only back without the language chip on drill-in routes", () => {
    vi.mocked(usePathname).mockReturnValue("/methods/srs-session");
    renderChrome(<FloatingShellChrome languages={twoLanguages} />);

    const back = screen.getByRole("link", {
      name: formatMessage(en.appShell.backTo, { destination: en.appShell.destinations.methods }),
    });
    expect(back.getAttribute("href")).toBe("/methods");
    expect(back.getAttribute("aria-current")).toBeNull();
    expect(back.className.split(/\s+/)).not.toContain("bg-accent");
    expect(back.textContent?.trim()).toBe("");
    expect(screen.queryByRole("button", { name: en.appShell.switchLanguage })).toBeNull();
    expect(screen.queryByText("🇪🇸")).toBeNull();
  });

  it("shows back without the language chip on words review", () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    renderChrome(<FloatingShellChrome languages={twoLanguages} />);

    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(2);
    expect(screen.queryByRole("button", { name: en.appShell.switchLanguage })).toBeNull();
    expect(screen.queryByText("🇪🇸")).toBeNull();
    expect(screen.getByRole("navigation", { name: en.appShell.mobileNavLabel })).toBeDefined();
  });

  it("anchors the footer scrim to the viewport bottom, not the pill lift", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    const { container } = renderChrome(<FloatingShellChrome languages={oneLanguage} />);

    const scrim = container.querySelector(".shell-float-footer-scrim");
    expect(scrim?.className).toContain("bottom-0");
    expect(scrim?.className).not.toContain("shell-float-nav-bottom");
  });

  it("renders no digit in the mobile navigation", () => {
    vi.mocked(usePathname).mockReturnValue("/methods");
    const { container } = renderChrome(
      <AppShell languages={oneLanguage}>
        <p>content</p>
      </AppShell>,
    );

    const floats = container.querySelectorAll("nav, form");
    const text = [...floats].map((node) => node.textContent ?? "").join(" ");
    expect(text).not.toMatch(/\d/);
  });

  it("has no accessibility violations", async () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    const { container } = renderChrome(<FloatingShellChrome languages={oneLanguage} />);

    await expectNoA11yViolations(container);
  });
});
