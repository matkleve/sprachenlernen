// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { indexablePublicRoutes } from "@/lib/site-metadata";

describe("discovery routes", () => {
  it("lists only indexable public URLs in the sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sprachenlernen.test");

    const entries = sitemap();
    expect(entries).toHaveLength(indexablePublicRoutes.length);
    expect(entries.map((entry) => new URL(entry.url).pathname).sort()).toEqual(
      [...indexablePublicRoutes].sort(),
    );
  });

  it("disallows app and auth paths in robots.txt", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sprachenlernen.test");

    const rules = robots();
    expect(rules.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
    });
    expect(rules.rules).toEqual(
      expect.objectContaining({
        disallow: expect.arrayContaining([
          "/methods",
          "/words",
          "/progress",
          "/login",
          "/signup",
          "/dev/",
        ]),
      }),
    );
    expect(rules.sitemap).toBe("https://sprachenlernen.test/sitemap.xml");
  });
});
