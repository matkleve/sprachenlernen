import {
  formatPrideVersion,
  parsePrideVersion,
  type PrideVersion,
} from "@/lib/pride-version";

export type AppVersionPayload = {
  version: string;
  /** ISO-8601 deploy timestamp from the running server build. */
  builtAt: string | null;
};

export function isDeployedVersionNewer(
  bundled: PrideVersion,
  deployedRaw: string,
): boolean {
  const deployed = parsePrideVersion(deployedRaw);
  if (deployed.proud !== bundled.proud) {
    return deployed.proud > bundled.proud;
  }
  if (deployed.default !== bundled.default) {
    return deployed.default > bundled.default;
  }
  return deployed.shame > bundled.shame;
}

export function formatBundledAppVersion(version: PrideVersion): string {
  return formatPrideVersion(version);
}
