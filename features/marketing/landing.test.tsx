import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen, within, fireEvent} from "@testing-library/react";

import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount } from "@/lib/db/auth";
import { expectNoA11yViolations } from "@/tests/axe";

import { hoursPerYear } from "@/lib/dose-band";

import { LandingHero } from "./LandingHero";
import { PublicHeader } from "./PublicHeader";

/**
 * The named check for docs/specs/page/landing.md. Each test maps to one
 * acceptance criterion in that spec — when a criterion changes, this file
 * changes in the same commit.
 */

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));
vi.mock("@/lib/db/auth", () => ({ getAccount: vi.fn() }));

const showHeaderAt = (pathname: string, signedIn = false) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(<PublicHeader signedIn={signedIn} />);
};

function mockDesktopViewport() {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query.includes("min-width"),
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
  vi.mocked(usePathname).mockClear();
  vi.mocked(getAccount).mockResolvedValue(null);
  mockDesktopViewport();
});

describe("PublicHeader", () => {
  it("shows sign-in and create-account on every marketing route when signed out", () => {
    const { container } = showHeaderAt("/login");

    expect(container.querySelector('img[src*="spiral-learning"]')).toBeTruthy();
    expect(screen.getByRole("link", { name: en.marketing.header.signIn }).getAttribute("href")).toBe(
      "/login",
    );
    expect(screen.getByRole("link", { name: en.marketing.header.signUp }).getAttribute("href")).toBe(
      "/signup",
    );
  });

  it("marks sign-in as current on /login without accent fill", () => {
    showHeaderAt("/login");
    const signIn = screen.getByRole("link", { name: en.marketing.header.signIn });
    expect(signIn.getAttribute("aria-current")).toBe("page");
    expect(signIn.className.split(/\s+/)).not.toContain("bg-accent");
  });

  it("does not mark sign-in as current off /login", () => {
    showHeaderAt("/");
    expect(
      screen.getByRole("link", { name: en.marketing.header.signIn }).getAttribute("aria-current"),
    ).toBeNull();
  });

  it("uses ghost sign-in and a single primary create-account control when signed out", () => {
    showHeaderAt("/");

    const signIn = screen.getByRole("link", { name: en.marketing.header.signIn });
    const signUp = screen.getByRole("link", { name: en.marketing.header.signUp });
    const signInClasses = signIn.className.split(/\s+/);
    const signUpClasses = signUp.className.split(/\s+/);

    expect(signInClasses).toContain("hover:bg-accent-soft");
    expect(signInClasses).not.toContain("bg-accent");
    expect(signUpClasses).toContain("bg-accent");

    const primaryLinks = screen
      .getAllByRole("link")
      .filter((link) => link.className.split(/\s+/).includes("bg-accent"));
    expect(primaryLinks).toHaveLength(1);
  });

  it("shows to-app and sign-out when signed in", () => {
    showHeaderAt("/", true);

    expect(screen.getByRole("link", { name: en.marketing.header.toApp }).getAttribute("href")).toBe(
      "/methods",
    );
    expect(screen.getByRole("button", { name: en.marketing.header.signOut })).toBeTruthy();
    expect(screen.queryByRole("link", { name: en.marketing.header.signIn })).toBeNull();
    expect(screen.queryByRole("link", { name: en.marketing.header.signUp })).toBeNull();
  });

  it("uses ghost sign-out and a single primary to-app control when signed in", () => {
    showHeaderAt("/", true);

    const signOut = screen.getByRole("button", { name: en.marketing.header.signOut });
    const toApp = screen.getByRole("link", { name: en.marketing.header.toApp });
    const signOutClasses = signOut.className.split(/\s+/);
    const toAppClasses = toApp.className.split(/\s+/);

    expect(signOutClasses).toContain("hover:bg-accent-soft");
    expect(signOutClasses).not.toContain("bg-accent");
    expect(toAppClasses).toContain("bg-accent");

    const primaryLinks = screen
      .getAllByRole("link")
      .filter((link) => link.className.split(/\s+/).includes("bg-accent"));
    expect(primaryLinks).toHaveLength(1);
  });

  it("does not render app-shell destination navigation", () => {
    showHeaderAt("/");

    expect(screen.queryByRole("navigation", { name: en.appShell.navLabel })).toBeNull();
  });

  it("shows a centred brand title and menu trigger on mobile", () => {
    const { container } = showHeaderAt("/");

    expect(container.querySelector(".fixed.inset-x-0.top-0")).toBeTruthy();
    expect(container.querySelector(".header-scrim-blur")).toBeTruthy();
    expect(container.textContent).toContain(en.marketing.header.brand);
    expect(screen.getByRole("button", { name: en.marketing.header.menu })).toBeDefined();
  });

  it("uses sticky desktop chrome with the shared scroll scrim", () => {
    const { container } = showHeaderAt("/");

    const desktopHeader = container.querySelector("header.sticky");
    expect(desktopHeader).toBeTruthy();
    expect(desktopHeader?.querySelector(".header-scrim-blur")).toBeTruthy();
  });

  it("reveals auth controls in the mobile menu when opened", () => {
    showHeaderAt("/");

    fireEvent.click(screen.getByRole("button", { name: en.marketing.header.menu }));

    const menu = screen.getByRole("menu", { name: en.marketing.header.menu });
    expect(within(menu).getByRole("link", { name: en.marketing.header.signIn })).toBeDefined();
    expect(within(menu).getByRole("link", { name: en.marketing.header.signUp })).toBeDefined();
  });

  it("reveals signed-in controls in the mobile menu when opened", () => {
    showHeaderAt("/", true);

    fireEvent.click(screen.getByRole("button", { name: en.marketing.header.menu }));

    const menu = screen.getByRole("menu", { name: en.marketing.header.menu });
    expect(within(menu).getByRole("link", { name: en.marketing.header.toApp })).toBeDefined();
    expect(within(menu).getByRole("button", { name: en.marketing.header.signOut })).toBeDefined();
  });

  it("uses ghost sign-in and a single primary create-account control in the mobile menu", () => {
    showHeaderAt("/");

    fireEvent.click(screen.getByRole("button", { name: en.marketing.header.menu }));
    const menu = screen.getByRole("menu", { name: en.marketing.header.menu });

    const signIn = within(menu).getByRole("link", { name: en.marketing.header.signIn });
    const signUp = within(menu).getByRole("link", { name: en.marketing.header.signUp });
    const signInClasses = signIn.className.split(/\s+/);
    const signUpClasses = signUp.className.split(/\s+/);

    expect(signInClasses).toContain("hover:bg-accent-soft");
    expect(signInClasses).not.toContain("bg-accent");
    expect(signUpClasses).toContain("bg-accent");

    const primaryLinks = within(menu)
      .getAllByRole("link")
      .filter((link) => link.className.split(/\s+/).includes("bg-accent"));
    expect(primaryLinks).toHaveLength(1);
  });
});

describe("LandingHero", () => {
  it("puts create account first and sign in second in the hero when signed out", async () => {
    vi.mocked(getAccount).mockResolvedValue(null);
    render(await LandingHero());

    const hero = screen.getByRole("heading", { level: 1 }).closest("div");
    expect(hero).toBeTruthy();
    const links = within(hero!).getAllByRole("link");
    const ctaLabels = [en.marketing.landing.primaryCta, en.marketing.landing.secondaryCta] as const;
    const ctaLinks = links.filter((a) =>
      ctaLabels.some((label) => a.textContent === label),
    );
    expect(ctaLinks.map((a) => a.textContent)).toEqual([
      en.marketing.landing.primaryCta,
      en.marketing.landing.secondaryCta,
    ]);
    expect(ctaLinks[0]?.getAttribute("href")).toBe("/signup");
    expect(ctaLinks[1]?.getAttribute("href")).toBe("/login");
  });

  it("shows only to-app in the hero when signed in", async () => {
    vi.mocked(getAccount).mockResolvedValue({ id: "u1", email: "a@example.com" });
    render(await LandingHero());

    const hero = screen.getByRole("heading", { level: 1 }).closest("div");
    expect(hero).toBeTruthy();
    const ctaLinks = within(hero!).getAllByRole("link").filter((a) =>
      [en.marketing.header.toApp, en.marketing.landing.primaryCta, en.marketing.landing.secondaryCta].some(
        (label) => a.textContent === label,
      ),
    );
    expect(ctaLinks).toHaveLength(1);
    expect(ctaLinks[0]?.textContent).toBe(en.marketing.header.toApp);
    expect(ctaLinks[0]?.getAttribute("href")).toBe("/methods");
  });

  it("quotes the study pillars without inventing a fourth", async () => {
    render(await LandingHero());

    expect(
      screen.getByText(
        formatMessage(en.marketing.landing.timeHonesty, { hours: Math.round(hoursPerYear(15)) }),
      ),
    ).toBeTruthy();

    for (const pillar of en.marketing.landing.pillars) {
      expect(screen.getByText(pillar.text)).toBeTruthy();
    }
    const pillarsSection = screen.getByText(en.marketing.landing.pillarsHeading).closest("section");
    expect(pillarsSection).toBeTruthy();
    expect(within(pillarsSection!).getAllByRole("listitem")).toHaveLength(
      en.marketing.landing.pillars.length,
    );
  });

  it("has no axe-core violations", async () => {
    const { container } = render(await LandingHero());
    await expectNoA11yViolations(container);
  });
});

describe("the / route", () => {
  it("forwards a Supabase confirmation code to /auth/callback", async () => {
    vi.mocked(redirect).mockClear();
    vi.mocked(getAccount).mockResolvedValue(null);

    const Home = (await import("@/app/(marketing)/page")).default;
    await Home({ searchParams: Promise.resolve({ code: "4fb7d79f-a085-4ab4-8e37-aaf52445cf30" }) });

    expect(redirect).toHaveBeenCalledWith(
      "/auth/callback?code=4fb7d79f-a085-4ab4-8e37-aaf52445cf30",
    );
  });

  it("renders the landing hero for signed-in visitors", async () => {
    vi.mocked(redirect).mockClear();
    vi.mocked(getAccount).mockResolvedValue({ id: "u1", email: "a@example.com" });

    const Home = (await import("@/app/(marketing)/page")).default;
    const result = await Home({ searchParams: Promise.resolve({}) });

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
