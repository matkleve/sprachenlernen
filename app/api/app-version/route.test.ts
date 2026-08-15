import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("/api/app-version", () => {
  it("returns the deployed Pride version without caching", async () => {
    const response = GET();
    const body = (await response.json()) as { version: string };

    expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
