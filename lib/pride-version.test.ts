import { describe, expect, it } from "vitest";

import packageJson from "../package.json";
import {
  APP_PRIDE_VERSION,
  APP_VERSION_LABEL,
  bumpPrideVersion,
  formatPrideVersion,
  parsePrideVersion,
} from "./pride-version";

describe("pride-version", () => {
  it("parses and formats PROUD.DEFAULT.SHAME", () => {
    expect(parsePrideVersion("2.7.123")).toEqual({ proud: 2, default: 7, shame: 123 });
    expect(formatPrideVersion({ proud: 2, default: 7, shame: 123 })).toBe("2.7.123");
  });

  it("bumps proud by resetting default and shame", () => {
    expect(bumpPrideVersion(parsePrideVersion("1.4.3"), "proud")).toEqual({
      proud: 2,
      default: 0,
      shame: 0,
    });
  });

  it("bumps default and resets shame", () => {
    expect(bumpPrideVersion(parsePrideVersion("1.4.3"), "default")).toEqual({
      proud: 1,
      default: 5,
      shame: 0,
    });
  });

  it("bumps shame only", () => {
    expect(bumpPrideVersion(parsePrideVersion("1.4.3"), "shame")).toEqual({
      proud: 1,
      default: 4,
      shame: 4,
    });
  });

  it("reads the app version from package.json", () => {
    const parsed = parsePrideVersion(packageJson.version);
    expect(APP_PRIDE_VERSION).toEqual(parsed);
    expect(APP_VERSION_LABEL).toBe(`v${formatPrideVersion(parsed)}`);
  });
});
