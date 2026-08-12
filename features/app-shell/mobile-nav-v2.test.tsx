import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { AppShell } from "./AppShell";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { copy as profileCopy } from "@/features/profile/content";

import { copy } from "./content";

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
  it("shows three pill destinations without a hamburger", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome languages={oneLanguage} />);

    expect(screen.queryByRole("button", { name: /menu/i })).toBeNull();

    const nav = screen.getByRole("navigation", { name: copy.mobileNavLabel });
    const links = nav.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(links).toHaveLength(3);
    expect([...links].map((link) => link.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      `${copy.destinations.methods}`,
      `${copy.destinations.words}`,
      `${copy.destinations.progress}`,
    ]);
  });

  it("shows the account chip and one Words link on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome languages={oneLanguage} />);

    // The corner carries one control, not two: sign out moved inside /profile
    // so the account is a link rather than competing with a form (ADR-0009).
    const account = screen.getByRole("link", { name: copy.account });
    expect(account.getAttribute("href")).toBe("/profile");
    expect(screen.queryByRole("button", { name: profileCopy.signOut })).toBeNull();
    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(1);
  });

  it("shows the language switcher on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome languages={twoLanguages} />);

    expect(
      screen.getByRole("combobox", { name: copy.switchLanguage }),
    ).toBeDefined();
  });

  it("keeps the language switcher beside back on drill-in routes", () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    render(<FloatingShellChrome languages={twoLanguages} />);

    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(2);
    expect(screen.getByRole("navigation", { name: copy.mobileNavLabel })).toBeDefined();
    expect(
      screen.getByRole("combobox", { name: copy.switchLanguage }),
    ).toBeDefined();
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
