#!/usr/bin/env node
/**
 * On main: learner-facing commits since the last version bump must have a newer
 * package.json version. Catches "merged but forgot to release". Local gate —
 * works without GitHub CI. Contract: docs/VERSIONING.md
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SHIP_PREFIXES = ["app/", "features/", "components/", "lib/", "messages/", "data/", "public/"];

const EXEMPT_PREFIXES = ["docs/", "scripts/", ".github/", "design/", ".agents/", ".claude/"];

const EXEMPT_FILES = new Set(["AGENTS.md", "CLAUDE.md", "README.md", "skills-lock.json"]);

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

function isPrideVersionNewer(left, right) {
  const a = parsePrideVersion(left);
  const b = parsePrideVersion(right);
  if (a.proud !== b.proud) return a.proud > b.proud;
  if (a.default !== b.default) return a.default > b.default;
  return a.shame > b.shame;
}

function versionAt(ref) {
  return JSON.parse(execSync(`git show ${ref}:package.json`, { encoding: "utf8" })).version;
}

function isShipPath(file) {
  if (EXEMPT_FILES.has(file)) return false;
  if (EXEMPT_PREFIXES.some((prefix) => file.startsWith(prefix))) return false;
  return SHIP_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function gitLines(command) {
  return execSync(command, { encoding: "utf8" })
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
if (branch !== "main") {
  process.exit(0);
}

let bumpCommit = null;
let bumpVersion = null;

for (const commit of gitLines("git log --format=%H")) {
  let parent;
  try {
    parent = execSync(`git rev-parse ${commit}^`, { encoding: "utf8" }).trim();
  } catch {
    break;
  }

  const commitVersion = versionAt(commit);
  const parentVersion = versionAt(parent);
  if (commitVersion !== parentVersion) {
    bumpCommit = commit;
    bumpVersion = commitVersion;
    break;
  }
}

if (!bumpCommit) {
  process.exit(0);
}

const changedFiles = gitLines(`git diff --name-only ${bumpCommit}..HEAD`);
const shipFiles = changedFiles.filter(isShipPath);

if (shipFiles.length === 0) {
  process.exit(0);
}

const headVersion = JSON.parse(readFileSync("package.json", "utf8")).version;

if (isPrideVersionNewer(headVersion, bumpVersion)) {
  process.exit(0);
}

console.error(
  `✗ version shipped check: main has learner-facing changes since v${bumpVersion} (${bumpCommit.slice(0, 7)}) but package.json is still ${headVersion}.`,
);
console.error(`  Changed ship paths (${shipFiles.length}): ${shipFiles.slice(0, 5).join(", ")}${shipFiles.length > 5 ? ", …" : ""}`);
console.error("  Run on main after merge:");
console.error("    npm run release:shame   # bugfix / regression");
console.error("    npm run release:ship    # feature / normal ship");
process.exit(1);
