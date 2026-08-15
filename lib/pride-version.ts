import packageJson from "../package.json";

/**
 * Pride Versioning (PROUD.DEFAULT.SHAME) — https://pridever.org/
 * Contract: docs/VERSIONING.md
 */

export type PrideBump = "proud" | "default" | "shame";

export type PrideVersion = {
  proud: number;
  default: number;
  shame: number;
};

const SEGMENT = /^\d+$/;

export function parsePrideVersion(raw: string): PrideVersion {
  const parts = raw.trim().split(".");
  if (parts.length !== 3) {
    throw new Error(`Pride version must be PROUD.DEFAULT.SHAME — got "${raw}"`);
  }

  const proud = parts[0];
  const def = parts[1];
  const shame = parts[2];
  if (
    proud === undefined ||
    def === undefined ||
    shame === undefined ||
    !SEGMENT.test(proud) ||
    !SEGMENT.test(def) ||
    !SEGMENT.test(shame)
  ) {
    throw new Error(`Pride version segments must be non-negative integers — got "${raw}"`);
  }

  return {
    proud: Number.parseInt(proud, 10),
    default: Number.parseInt(def, 10),
    shame: Number.parseInt(shame, 10),
  };
}

export function formatPrideVersion(version: PrideVersion): string {
  return `${version.proud}.${version.default}.${version.shame}`;
}

/** Bump per https://pridever.org/ — proud resets default and shame to 0. */
export function bumpPrideVersion(version: PrideVersion, kind: PrideBump): PrideVersion {
  switch (kind) {
    case "proud":
      return { proud: version.proud + 1, default: 0, shame: 0 };
    case "default":
      return { ...version, default: version.default + 1, shame: 0 };
    case "shame":
      return { ...version, shame: version.shame + 1 };
  }
}

export const APP_PRIDE_VERSION = parsePrideVersion(packageJson.version);

/** Shown under the mobile destination pill — includes a leading v. */
export const APP_VERSION_LABEL = `v${formatPrideVersion(APP_PRIDE_VERSION)}`;
