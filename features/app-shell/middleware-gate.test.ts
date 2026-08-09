// @vitest-environment node
//
// Not jsdom: `NextRequest` validates that `request.headers` is the platform
// `Headers`, and jsdom substitutes its own. The failure reads as "must be an
// instance of Headers" on a header nobody set, which is a confusing hour if
// you do not know to look here. Nothing in this file renders anything.

import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { protectedRoutes, requiresAccount, routes } from "@/lib/routes";

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
  it("protects exactly the three destinations, and nothing public", () => {
    // One list, read by both the middleware and the shell. If a fourth
    // destination is ever added, this is where it is noticed.
    expect([...protectedRoutes]).toEqual([routes.methods, routes.words, routes.progress]);

    for (const route of [routes.landing, routes.languages, routes.signIn, routes.signUp]) {
      expect(requiresAccount(route), `${route} is public`).toBe(false);
    }
  });

  it("counts a nested route as inside the destination above it", () => {
    expect(requiresAccount("/words/atlas")).toBe(true);
    // ...but not a route that merely starts with the same letters.
    expect(requiresAccount("/methods-archive")).toBe(false);
  });
});

describe("a signed-out request", () => {
  beforeEach(() => signedInAs(null));

  it("is turned away from every protected route before anything renders", async () => {
    for (const route of protectedRoutes) {
      const response = await get(route);

      expect(response.status, `${route} must redirect`).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe(routes.signIn);
      // The body is what the production build got wrong: a redirect issued
      // from a layout still carries the rendered page in it.
      expect(await response.text()).toBe("");
    }
  });

  it("is left alone on the public routes", async () => {
    for (const route of [routes.landing, routes.languages, routes.signIn]) {
      expect((await get(route)).status, `${route} must not redirect`).toBe(200);
    }
  });
});

describe("a signed-in request", () => {
  beforeEach(() => signedInAs({ id: "u1" }));

  it("reaches every protected route", async () => {
    for (const route of protectedRoutes) {
      expect((await get(route)).status, `${route} must be reachable`).toBe(200);
    }
  });
});
