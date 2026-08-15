import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { AppShell } from "./AppShell";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { APP_VERSION_LABEL } from "@/lib/pride-version";
import { copy as profileCopy } from "@/features/profile/content";

import { copy, holding } from "./content";

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
});

describe("SPEC-feature-mobile-nav-v2", () => {
  it("shows pill destinations without a hamburger", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    const { container } = render(<FloatingShellChrome languages={oneLanguage} />);

    expect(screen.queryByRole("button", { name: /menu/i })).toBeNull();
    expect(container.querySelector(".footer-scrim-blur")).not.toBeNull();
    expect(container.querySelector(".shell-float-footer-scrim")).not.toBeNull();
    expect(container.querySelector(".shell-float-nav-pill")).not.toBeNull();
    expect(container.querySelector(".pointer-events-auto.absolute.inset-0")).not.toBeNull();

    const nav = screen.getByRole("navigation", { name: copy.mobileNavLabel });
    const links = nav.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(4);
    expect(nav.querySelector("ul")?.className).toContain("inline-flex");
    expect(screen.getByRole("link", { name: copy.destinations.methods })).toBeDefined();
    expect(screen.getByRole("link", { name: copy.destinations.words })).toBeDefined();
    expect(screen.getByRole("link", { name: copy.destinations.progress })).toBeDefined();
    for (const link of links) {
      expect(link.textContent?.trim()).toBe("");
    }
    expect(screen.getByText(APP_VERSION_LABEL)).toBeDefined();
  });

  it("shows the account icon chip and one Words link on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome languages={oneLanguage} />);

    const account = screen.getByRole("link", { name: copy.account });
    expect(account.getAttribute("href")).toBe("/profile");
    expect(account.textContent?.trim()).toBe("");
    expect(screen.queryByRole("button", { name: profileCopy.signOut })).toBeNull();
    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: holding.words.title })).toBeDefined();
  });

  it("shows the language emoji on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome languages={twoLanguages} />);

    expect(screen.getByRole("button", { name: copy.switchLanguage })).toBeDefined();
    expect(screen.getByText("🇪🇸")).toBeDefined();
  });

  it("shows icon-only back without the language chip on drill-in routes", () => {
    vi.mocked(usePathname).mockReturnValue("/methods/srs-session");
    render(<FloatingShellChrome languages={twoLanguages} />);

    const back = screen.getByRole("link", { name: copy.backTo(copy.destinations.methods) });
    expect(back.getAttribute("href")).toBe("/methods");
    expect(back.textContent?.trim()).toBe("");
    expect(screen.queryByRole("button", { name: copy.switchLanguage })).toBeNull();
    expect(screen.queryByText("🇪🇸")).toBeNull();
  });

  it("shows back without the language chip on words review", () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    render(<FloatingShellChrome languages={twoLanguages} />);

    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(2);
    expect(screen.queryByRole("button", { name: copy.switchLanguage })).toBeNull();
    expect(screen.queryByText("🇪🇸")).toBeNull();
    expect(screen.getByRole("navigation", { name: copy.mobileNavLabel })).toBeDefined();
  });

  it("anchors the footer scrim to the viewport bottom, not the pill lift", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    const { container } = render(<FloatingShellChrome languages={oneLanguage} />);

    const scrim = container.querySelector(".shell-float-footer-scrim");
    expect(scrim?.className).toContain("bottom-0");
    expect(scrim?.className).not.toContain("shell-float-nav-bottom");
  });

  it("renders no digit in the mobile navigation", () => {
    vi.mocked(usePathname).mockReturnValue("/methods");
    const { container } = render(
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
    const { container } = render(<FloatingShellChrome languages={oneLanguage} />);

    await expectNoA11yViolations(container);
  });
});
