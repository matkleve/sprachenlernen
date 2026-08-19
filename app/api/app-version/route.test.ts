import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("/api/app-version", () => {
  it("returns the deployed Pride version and build time without caching", async () => {
    const response = GET();
    const body = (await response.json()) as { version: string; builtAt: string | null };

    expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
    if (body.builtAt !== null) {
      expect(Date.parse(body.builtAt)).not.toBeNaN();
    }
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
