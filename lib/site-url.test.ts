import { afterEach, describe, expect, it } from "vitest";

import { getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://sprachenlernen.vercel.app/";
    process.env.VERCEL_URL = "preview-abc.vercel.app";
    expect(getSiteUrl()).toBe("https://sprachenlernen.vercel.app");
  });

  it("falls back to VERCEL_URL for preview deployments", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = "preview-abc.vercel.app";
    expect(getSiteUrl()).toBe("https://preview-abc.vercel.app");
  });

  it("defaults to localhost for local dev", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
