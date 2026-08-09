import { afterEach, describe, expect, it } from "vitest";

import { getInstallationId } from "@/lib/installation-id";

describe("getInstallationId", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("creates and reuses one UUID per browser profile", () => {
    const first = getInstallationId();
    const second = getInstallationId();

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second).toBe(first);
  });

  it("replaces a corrupt stored value with a fresh UUID", () => {
    window.localStorage.setItem("sl-installation-id", "not-a-uuid");
    const id = getInstallationId();
    expect(id).not.toBe("not-a-uuid");
    expect(window.localStorage.getItem("sl-installation-id")).toBe(id);
  });
});
