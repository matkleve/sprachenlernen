#!/usr/bin/env node
/**
 * Blocks version bumps on feature branches — stops parallel agents fighting over
 * package.json. Contract: docs/VERSIONING.md
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
if (branch === "main") {
  process.exit(0);
}

let baseRef = "origin/main";
try {
  execSync("git rev-parse --verify origin/main", { stdio: "ignore" });
} catch {
  baseRef = "main";
}

let baseVersion;
try {
  const mergeBase = execSync(`git merge-base HEAD ${baseRef}`, { encoding: "utf8" }).trim();
  baseVersion = JSON.parse(execSync(`git show ${mergeBase}:package.json`, { encoding: "utf8" })).version;
} catch {
  process.exit(0);
}

const headVersion = JSON.parse(readFileSync("package.json", "utf8")).version;

if (headVersion !== baseVersion) {
  console.error(
    `✗ version branch check: package.json is ${headVersion} but the merge-base with ${baseRef} is ${baseVersion}.`,
  );
  console.error("  Do not bump version on a feature branch.");
  console.error("  Merge to main, then run: npm run version:ship");
  process.exit(1);
}
