#!/usr/bin/env node
/**
 * Bump package.json version using Pride Versioning (PROUD.DEFAULT.SHAME).
 * Contract: docs/VERSIONING.md
 *
 * Usage: node scripts/bump-pride-version.mjs <proud|default|shame>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function parsePrideVersion(raw) {
  const parts = raw.trim().split(".");
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    throw new Error(`Pride version must be PROUD.DEFAULT.SHAME — got "${raw}"`);
  }
  return {
    proud: Number.parseInt(parts[0], 10),
    default: Number.parseInt(parts[1], 10),
    shame: Number.parseInt(parts[2], 10),
  };
}

function formatPrideVersion(version) {
  return `${version.proud}.${version.default}.${version.shame}`;
}

function bumpPrideVersion(version, bump) {
  switch (bump) {
    case "proud":
      return { proud: version.proud + 1, default: 0, shame: 0 };
    case "default":
      return { ...version, default: version.default + 1, shame: 0 };
    case "shame":
      return { ...version, shame: version.shame + 1 };
    default:
      throw new Error(`Unknown bump: ${bump}`);
  }
}

function writePrideVersion(root, next) {
  const packagePath = join(root, "package.json");
  const lockPath = join(root, "package-lock.json");

  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  pkg.version = next;
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock.version = next;
  if (lock.packages?.[""]) {
    lock.packages[""].version = next;
  }
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

const kind = process.argv[2];
const allowed = new Set(["proud", "default", "shame"]);

if (!allowed.has(kind)) {
  console.error("Usage: node scripts/bump-pride-version.mjs <proud|default|shame>");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const packagePath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
const next = formatPrideVersion(bumpPrideVersion(parsePrideVersion(pkg.version), kind));
writePrideVersion(root, next);

console.log(next);
