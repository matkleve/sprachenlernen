// @vitest-environment node
//
// Not jsdom: `NextRequest` validates that `request.headers` is the platform
// `Headers`, and jsdom substitutes its own. The failure reads as "must be an
// instance of Headers" on a header nobody set, which is a confusing hour if
// you do not know to look here. Nothing in this file renders anything.

import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { collectAppRoutes } from "@/lib/collect-app-routes";
import { protectedRoutes, publicRoutes, requiresAccount, routes } from "@/lib/routes";

import { middleware } from "@/middleware";

/**
 * Part of the named check for docs/specs/feature/app-shell.md — the half that
 * only a production build exposed.
 *
 * The gate in app/(app)/layout.tsx is real but it is not sufficient: a
 * layout's redirect resolves alongside the page under it, so the page is
 * already rendered into the body by the time the redirect wins. Nothing in
 * jsdom can observe that, which is exactly why this asserts on the middleware
 * — the only layer that runs before rendering starts.
 */

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

const signedInAs = (user: { id: string } | null) => {
  vi.mocked(createServerClient).mockReturnValue({
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    // The middleware only ever touches `auth.getUser`; the rest of the client
    // is not this test's business.
  } as unknown as ReturnType<typeof createServerClient>);
};

const get = (pathname: string) =>
  middleware(new NextRequest(new URL(pathname, "https://example.test")));

beforeEach(() => {
  vi.mocked(createServerClient).mockClear();
});

describe("the route model", () => {
  it("lists exactly the three shell destinations", () => {
    expect([...protectedRoutes]).toEqual([routes.methods, routes.words, routes.progress]);
  });

  it("leaves every marketing route public", () => {
    for (const route of publicRoutes) {
      expect(requiresAccount(route), `${route} is public`).toBe(false);
    }
  });

  it("requires an account for every page under app/(app)/", () => {
    const appRoutes = collectAppRoutes();
    expect(appRoutes.length).toBeGreaterThan(0);

    for (const route of appRoutes) {
      expect(requiresAccount(route), `${route} must be gated`).toBe(true);
    }

    // The three destinations are pages in that tree — not a separate allowlist.
    for (const route of protectedRoutes) {
      expect(appRoutes, `${route} must exist under (app)`).toContain(route);
    }
  });

  it("gates a nested route under a destination", () => {
    expect(requiresAccount("/words/atlas")).toBe(true);
  });
});

describe("a signed-out request", () => {
  beforeEach(() => signedInAs(null));

  it("is turned away from every (app) route before anything renders", async () => {
    for (const route of collectAppRoutes()) {
      const response = await get(route);

      expect(response.status, `${route} must redirect`).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe(routes.signIn);
    }
  });

  it("is turned away from a route that exists only under (app) but is not a destination", async () => {
    // The failure mode the adversarial review reproduced: a page added to the
    // group without touching protectedRoutes. The gate is inverted now, so the
    // predicate does not need updating — only the filesystem scan above fails
    // if someone removes the inversion.
    expect(requiresAccount("/settings")).toBe(true);
    const response = await get("/settings");
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe(routes.signIn);
  });

  it("is left alone on the public routes", async () => {
    for (const route of publicRoutes) {
      expect((await get(route)).status, `${route} must not redirect`).toBe(200);
    }
  });
});

describe("a signed-in request", () => {
  beforeEach(() => signedInAs({ id: "u1" }));

  it("reaches every destination", async () => {
    for (const route of protectedRoutes) {
      expect((await get(route)).status, `${route} must be reachable`).toBe(200);
    }
  });
});
