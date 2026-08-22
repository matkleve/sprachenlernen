#!/usr/bin/env node
/**
 * Post-merge version bump — the only command agents should use to release.
 * Contract: docs/VERSIONING.md
 */

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const allowBranch = process.argv.includes("--allow-branch");
const branch = execSync("git branch --show-current", { encoding: "utf8", cwd: root }).trim();

if (branch !== "main" && !allowBranch) {
  console.error(
    `version:ship must run on main (currently "${branch}"). Merge the PR first, then checkout main.`,
  );
  process.exit(1);
}

const next = execSync("node scripts/release/bump-pride-version.mjs default", {
  encoding: "utf8",
  cwd: root,
}).trim();

console.log(`Shipped ${next}. Commit package.json and package-lock.json, then push main.`);
