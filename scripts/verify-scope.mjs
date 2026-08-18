#!/usr/bin/env node
/**
 * Scoped verify — fast iteration gate. Full `npm run verify` is for commit/merge.
 * Contract: docs/VERIFY-SCOPES.md
 */

import { spawnSync } from "node:child_process";

/** @type {Record<string, { desc: string; checks: string[]; tests: string[]; vitestChanged?: boolean }>} */
const SCOPES = {
  docs: {
    desc: "Specs, use cases, studies only — no code",
    checks: ["specs"],
    tests: [],
  },
  changed: {
    desc: "Git-changed files — vitest runs related tests automatically",
    checks: ["typecheck", "lint", "specs", "tokens", "contrast"],
    tests: [],
    vitestChanged: true,
  },
  ui: {
    desc: "Component layout/classes/tokens — pass vitest patterns after the scope name",
    checks: ["typecheck", "lint", "tokens", "contrast", "specs"],
    tests: [],
  },
  "method-menu": {
    desc: "Method catalogue cards, headers, badges, filters, /methods",
    checks: ["typecheck", "lint", "tokens", "contrast", "specs"],
    tests: [
      "features/method-menu",
      "lib/method-catalogue",
      "lib/method-menu-filter",
      "lib/method-skill-badges",
      "lib/skill-tier",
    ],
  },
  "app-shell": {
    desc: "Shell chrome, headers, page layout, nav",
    checks: ["typecheck", "lint", "tokens", "contrast", "interaction", "specs"],
    tests: ["features/app-shell", "lib/shell-page-layout"],
  },
  words: {
    desc: "Words home, review cards, vocabulary UI",
    checks: ["typecheck", "lint", "tokens", "contrast", "specs"],
    tests: ["features/words", "app/(app)/words", "features/review-session", "lib/vocabulary"],
  },
  lib: {
    desc: "lib/ helpers — pass test file globs after the scope name",
    checks: ["typecheck", "lint"],
    tests: [],
  },
  route: {
    desc: "New/changed app routes — adds build (no full test suite)",
    checks: ["typecheck", "lint", "specs", "build"],
    tests: [],
  },
};

const scopeName = process.argv[2];

if (!scopeName || scopeName === "--help" || scopeName === "-h") {
  console.log("Usage: npm run verify:scope -- <scope> [vitest-patterns…]\n");
  console.log("Scopes (iterate with these; full gate only before commit):\n");
  for (const [name, { desc, checks, tests, vitestChanged }] of Object.entries(SCOPES)) {
    const testHint = vitestChanged ? "vitest --changed" : tests.length ? tests.join(" ") : "(pass patterns)";
    console.log(`  ${name.padEnd(14)} ${desc}`);
    console.log(`  ${"".padEnd(14)} checks: ${checks.join(", ")}`);
    console.log(`  ${"".padEnd(14)} tests: ${testHint}\n`);
  }
  console.log("Examples:");
  console.log("  npm run verify:scope -- method-menu");
  console.log("  npm run verify:scope -- changed");
  console.log("  npm run verify:scope -- ui method-card-header");
  console.log("  npm run verify:scope -- lib lib/skill-tier.test.ts");
  process.exit(scopeName ? 0 : 2);
}

const scope = SCOPES[scopeName];
if (!scope) {
  console.error(`Unknown scope "${scopeName}". Run: npm run verify:scope -- --help`);
  process.exit(2);
}

const extraTests = process.argv.slice(3);
const tests = extraTests.length ? extraTests : scope.tests;

const failed = [];

for (const check of scope.checks) {
  process.stdout.write(`\n\x1b[1m▸ ${check}\x1b[0m\n`);
  const { status } = spawnSync("node", ["scripts/verify.mjs", check], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (status !== 0) failed.push(check);
}

if (scope.vitestChanged) {
  process.stdout.write(`\n\x1b[1m▸ test (changed)\x1b[0m\n`);
  const { status } = spawnSync("npm", ["run", "--silent", "test", "--", "--changed"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (status !== 0) failed.push("test");
} else if (tests.length) {
  process.stdout.write(`\n\x1b[1m▸ test (${tests.join(" ")})\x1b[0m\n`);
  const { status } = spawnSync("npm", ["run", "--silent", "test", "--", ...tests], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (status !== 0) failed.push("test");
}

console.log("\n" + "─".repeat(56));
if (failed.length) {
  console.error(
    `\n\x1b[31m✗ verify:scope ${scopeName} failed: ${failed.join(", ")}\x1b[0m\n` +
      `  Before commit: npm run verify\n`,
  );
  process.exit(1);
}

console.log(
  `\n\x1b[32m✓ verify:scope ${scopeName} passed\x1b[0m` +
    ` — scoped iteration gate only.\n` +
    `  Before commit/merge: npm run verify\n`,
);
