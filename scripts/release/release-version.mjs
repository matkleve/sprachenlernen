#!/usr/bin/env node
/**
 * Post-merge release — bump, commit, optional push. One command so agents do
 * not forget a step. Contract: docs/VERSIONING.md
 *
 * Usage: node scripts/release-version.mjs <shame|ship|proud> [--no-push] [--no-pull]
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const kind = process.argv[2];
const noPush = process.argv.includes("--no-push");
const noPull = process.argv.includes("--no-pull");

const allowed = new Set(["shame", "ship", "proud"]);
const bumpKind = { shame: "shame", ship: "default", proud: "proud" };

if (!allowed.has(kind)) {
  console.error("Usage: node scripts/release-version.mjs <shame|ship|proud> [--no-push] [--no-pull]");
  process.exit(1);
}

const branch = execSync("git branch --show-current", { encoding: "utf8", cwd: root }).trim();
if (branch !== "main") {
  console.error(
    `release must run on main (currently "${branch}"). Merge first, then checkout main.`,
  );
  process.exit(1);
}

const dirty = execSync("git status --porcelain", { encoding: "utf8", cwd: root }).trim();
if (dirty) {
  console.error("✗ release: working tree is not clean. Commit or stash changes first.");
  process.exit(1);
}

if (!noPull) {
  try {
    execSync("git pull --ff-only", { stdio: "inherit", cwd: root });
  } catch {
    console.error("✗ release: git pull --ff-only failed. Fix upstream, or pass --no-pull.");
    process.exit(1);
  }
}

const before = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const next = execSync(`node scripts/release/bump-pride-version.mjs ${bumpKind[kind]}`, {
  encoding: "utf8",
  cwd: root,
}).trim();

if (next === before) {
  console.error(`✗ release: bump did not change version (still ${before}).`);
  process.exit(1);
}

execSync("git add package.json package-lock.json", { stdio: "inherit", cwd: root });
execSync(`git commit -m "chore: ship v${next}"`, { stdio: "inherit", cwd: root });

console.log(`Released v${next} on main.`);

if (noPush) {
  console.log("Skipped push (--no-push). Push when GitHub is available: git push origin main");
  process.exit(0);
}

try {
  execSync("git push origin main", { stdio: "inherit", cwd: root });
} catch {
  console.error("✗ release: commit succeeded locally but push failed.");
  console.error("  GitHub unreachable? Push later: git push origin main");
  process.exit(1);
}
