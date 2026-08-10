import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { AppShell } from "./AppShell";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { copy } from "./content";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
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
    render(<FloatingShellChrome />);

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

  it("shows sign-out float and one Words link on a destination root", () => {
    vi.mocked(usePathname).mockReturnValue("/words");
    render(<FloatingShellChrome />);

    expect(screen.getByRole("button", { name: copy.signOut })).toBeDefined();
    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(1);
  });

  it("shows back chip and pill on drill-in routes", () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    render(<FloatingShellChrome />);

    const wordsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/words");
    expect(wordsLinks).toHaveLength(2);
    expect(screen.getByRole("navigation", { name: copy.mobileNavLabel })).toBeDefined();
  });

  it("renders no digit in the mobile navigation", () => {
    vi.mocked(usePathname).mockReturnValue("/methods");
    const { container } = render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );

    const floats = container.querySelectorAll("nav, form");
    const text = [...floats].map((node) => node.textContent ?? "").join(" ");
    expect(text).not.toMatch(/\d/);
  });

  it("has no accessibility violations", async () => {
    vi.mocked(usePathname).mockReturnValue("/words/review");
    const { container } = render(<FloatingShellChrome />);

    await expectNoA11yViolations(container);
  });
});
