import { describe, expect, it } from "vitest";

import { isDeployedVersionNewer } from "@/lib/app-version";
import { parsePrideVersion } from "@/lib/pride-version";

describe("app-version", () => {
  const bundled = parsePrideVersion("0.1.0");

  it("returns false when versions match", () => {
    expect(isDeployedVersionNewer(bundled, "0.1.0")).toBe(false);
  });

  it("returns true when the deployed shame segment is higher", () => {
    expect(isDeployedVersionNewer(bundled, "0.1.1")).toBe(true);
  });

  it("returns true when the deployed default segment is higher", () => {
    expect(isDeployedVersionNewer(bundled, "0.2.0")).toBe(true);
  });

  it("returns false when the deployed version is older", () => {
    expect(isDeployedVersionNewer(bundled, "0.0.9")).toBe(false);
  });
});
