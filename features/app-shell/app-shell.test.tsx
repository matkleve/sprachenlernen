import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {within} from "@testing-library/react";

import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccount, signOut } from "@/lib/db/auth";
import { expectNoA11yViolations } from "@/tests/axe";

import { AppShell } from "./AppShell";
import { signOutAction } from "./actions";

import { requireAccount } from "./gate";

/**
 * The named check for docs/specs/feature/app-shell.md. Each test maps to one
 * acceptance criterion in that spec — when a criterion changes, this file
 * changes in the same commit.
 */

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));
vi.mock("@/lib/db/auth", () => ({ getAccount: vi.fn(), signOut: vi.fn() }));

const account = { id: "u1", email: "a@example.com" };

const showAt = (
  pathname: string,
  languages = [{ code: "es", endonym: "Español", isActive: true }],
) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return render(
    <AppShell languages={languages}>
      <p>the destination</p>
    </AppShell>,
  );
};

/** Desktop nav is `hidden md:block` — stub wide viewport so existing shell tests stay valid. */
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

const destinationLinks = () => {
  const header = document.querySelector("header");
  if (!header) throw new Error("expected desktop header");
  return within(header as HTMLElement)
    .getByRole("navigation", { name: en.appShell.navLabel })
    .querySelectorAll<HTMLAnchorElement>("a[href]");
};

beforeEach(() => {
  vi.mocked(redirect).mockClear();
  vi.mocked(getAccount).mockClear();
  vi.mocked(signOut).mockClear();
  mockDesktopViewport();
});

describe("the destinations", () => {
  it("renders shell destinations in order, each linking to its route", () => {
    showAt("/methods");

    const links = [...destinationLinks()];
    expect(links.map((a) => a.getAttribute("aria-label"))).toEqual([
      en.appShell.destinations.methods,
      en.appShell.destinations.words,
      en.appShell.destinations.progress,
    ]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/methods",
      "/words",
      "/progress",
    ]);
  });

  it("marks the destination you are on, and marks no other", () => {
    showAt("/methods");

    const current = [...destinationLinks()].filter(
      (a) => a.getAttribute("aria-current") === "page",
    );
    expect(current.map((a) => a.getAttribute("aria-label"))).toEqual([
      en.appShell.destinations.methods,
    ]);
  });

  it("moves the marker with the route, leaving no residue on the previous one", () => {
    showAt("/words");

    const marked = [...destinationLinks()].filter(
      (a) => a.getAttribute("aria-current") === "page",
    );
    expect(marked.map((a) => a.getAttribute("aria-label"))).toEqual([
      en.appShell.destinations.words,
    ]);
    // The negative half: the destination we are NOT on must carry nothing.
    const methods = [...destinationLinks()].find(
      (a) => a.getAttribute("aria-label") === en.appShell.destinations.methods,
    );
    expect(methods?.getAttribute("aria-current")).toBeNull();
  });

  it("marks a nested route under a destination as that destination", () => {
    showAt("/words/review");

    const marked = [...destinationLinks()].filter(
      (a) => a.getAttribute("aria-current") === "page",
    );
    expect(marked.map((a) => a.getAttribute("aria-label"))).toEqual([
      en.appShell.destinations.words,
    ]);
  });

  it("renders no digit anywhere in the navigation — UC-063's whole point", () => {
    // No badge, no dot, no "12 due". study/10 A3 calls the backlog counter the
    // most common exit route from Anki, and a tab badge is the most prominent
    // figure a phone has. Asserting on digits catches a count added in any
    // form, including one smuggled into a label.
    showAt("/methods");

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    const nav = within(header as HTMLElement).getByRole("navigation", { name: en.appShell.navLabel });
    expect(nav.textContent).not.toMatch(/\d/);
  });

  it("has no accessibility violations", async () => {
    const { container } = showAt("/methods");

    await expectNoA11yViolations(container);
  });

  it("renders a language switcher when more than one language is being learned", () => {
    showAt("/methods", [
      { code: "es", endonym: "Español", isActive: true },
      { code: "it", endonym: "Italiano", isActive: false },
    ]);

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    expect(
      within(header as HTMLElement).getByRole("button", { name: en.appShell.switchLanguage }),
    ).toBeDefined();
  });

  it("renders an account link, and sign-out is no longer in the header", () => {
    showAt("/methods");

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    const account = within(header as HTMLElement).getByRole("link", { name: en.appShell.account });
    expect(account.getAttribute("href")).toBe("/profile");
    expect(account.getAttribute("aria-current")).toBeNull();
    expect(
      within(header as HTMLElement).queryByRole("button", { name: en.profile.signOut }),
    ).toBeNull();
  });

  it("marks the account link as current on /profile", () => {
    showAt("/profile");

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    const account = within(header as HTMLElement).getByRole("link", { name: en.appShell.account });
    expect(account.getAttribute("aria-current")).toBe("page");
    expect(account.className).toContain("bg-accent");
  });

  it("shows the page title centered in the desktop header", () => {
    showAt("/words");

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    expect(
      within(header as HTMLElement).getByRole("heading", { level: 1, name: en.appShell.holding.words.title }),
    ).toBeDefined();
  });

  it("lays out the desktop header so the title is centred without overlapping nav icons", () => {
    showAt("/methods");

    const header = document.querySelector("header");
    if (!header) throw new Error("expected desktop header");
    const grid = header.querySelector(".grid-cols-\\[1fr_1fr\\]");
    expect(grid).not.toBeNull();
    expect(
      within(header as HTMLElement).getByRole("heading", { level: 1, name: en.methodMenu.title }),
    ).toBeDefined();
  });
});

describe("the account gate", () => {
  it("sends a signed-out visitor to /login", async () => {
    vi.mocked(getAccount).mockResolvedValue(null);

    await requireAccount();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("lets a signed-in Account through, and redirects nowhere", async () => {
    vi.mocked(getAccount).mockResolvedValue(account);

    expect(await requireAccount()).toEqual(account);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("signing out", () => {
  it("ends the session and lands on the public landing page", async () => {
    vi.mocked(signOut).mockResolvedValue({ status: "signed-out" });

    await signOutAction();

    expect(signOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/");
  });
});

describe("where the shell may render", () => {
  const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

  it("is mounted by the (app) layout", () => {
    expect(read("app/(app)/layout.tsx")).toContain("AppShell");
  });

  it("is not reachable from any (marketing) route", () => {
    // The shell aimed at people who cannot use it is the failure ADR-0010's
    // route groups exist to prevent, and nothing but this test enforces it.
    const dir = "app/(marketing)";
    const files = readdirSync(join(process.cwd(), dir), { recursive: true, encoding: "utf8" });

    for (const file of files) {
      if (!file.endsWith(".tsx")) continue;
      expect(read(join(dir, file)), `${file} must not mount the app shell`).not.toContain(
        "app-shell",
      );
    }
  });
});
