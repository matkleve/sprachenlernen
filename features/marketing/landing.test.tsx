import { render, screen, within } from "@testing-library/react";
import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { copy as shellCopy } from "@/features/app-shell/content";
import { getAccount } from "@/lib/db/auth";
import { expectNoA11yViolations } from "@/tests/axe";

import { LandingHero } from "./LandingHero";
import { PublicHeader } from "./PublicHeader";
import { copy } from "./content";

/**
 * The named check for docs/specs/page/landing.md. Each test maps to one
 * acceptance criterion in that spec — when a criterion changes, this file
 * changes in the same commit.
 */

vi.mock("next/navigation", () => ({ redirect: vi.fn(), usePathname: vi.fn() }));
vi.mock("@/lib/db/auth", () => ({ getAccount: vi.fn() }));

const showHeaderAt = (pathname: string) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(<PublicHeader />);
};

beforeEach(() => {
  vi.mocked(usePathname).mockClear();
});

describe("PublicHeader", () => {
  it("shows sign-in and create-account on every marketing route", () => {
    showHeaderAt("/login");

    expect(screen.getByRole("link", { name: copy.header.signIn }).getAttribute("href")).toBe(
      "/login",
    );
    expect(screen.getByRole("link", { name: copy.header.signUp }).getAttribute("href")).toBe(
      "/signup",
    );
  });

  it("marks sign-in as current on /login", () => {
    showHeaderAt("/login");
    expect(screen.getByRole("link", { name: copy.header.signIn }).getAttribute("aria-current")).toBe(
      "page",
    );
  });

  it("does not mark sign-in as current off /login", () => {
    showHeaderAt("/");
    expect(
      screen.getByRole("link", { name: copy.header.signIn }).getAttribute("aria-current"),
    ).toBeNull();
  });

  it("does not render app-shell destination navigation", () => {
    showHeaderAt("/");

    expect(screen.queryByRole("navigation", { name: shellCopy.navLabel })).toBeNull();
  });
});

describe("LandingHero", () => {
  it("puts create account first and sign in second in the hero", () => {
    render(<LandingHero />);

    const hero = screen.getByRole("heading", { level: 1 }).closest("div");
    expect(hero).toBeTruthy();
    const links = within(hero!).getAllByRole("link");
    const ctaLabels = [copy.landing.primaryCta, copy.landing.secondaryCta] as const;
    const ctaLinks = links.filter((a) =>
      ctaLabels.some((label) => a.textContent === label),
    );
    expect(ctaLinks.map((a) => a.textContent)).toEqual([
      copy.landing.primaryCta,
      copy.landing.secondaryCta,
    ]);
    expect(ctaLinks[0]?.getAttribute("href")).toBe("/signup");
    expect(ctaLinks[1]?.getAttribute("href")).toBe("/login");
  });

  it("quotes the study pillars without inventing a fourth", () => {
    render(<LandingHero />);

    for (const pillar of copy.landing.pillars) {
      expect(screen.getByText(pillar.text)).toBeTruthy();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(copy.landing.pillars.length);
  });

  it("has no axe-core violations", async () => {
    const { container } = render(<LandingHero />);
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

  it("redirects signed-in visitors to /methods", async () => {
    vi.mocked(redirect).mockClear();
    vi.mocked(getAccount).mockResolvedValue({ id: "u1", email: "a@example.com" });

    const Home = (await import("@/app/(marketing)/page")).default;
    await Home({ searchParams: Promise.resolve({}) });

    expect(redirect).toHaveBeenCalledWith("/methods");
  });
});
