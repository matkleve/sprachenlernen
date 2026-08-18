#!/usr/bin/env node
/**
 * The gate. One command, so that "did you run the checks?" has one answer.
 *
 * Six separate npm scripts is how a check gets skipped: not out of laziness,
 * but because nobody can hold the list. Everything runs even after a failure,
 * so one run tells you everything that is wrong rather than the first thing.
 */

import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const CHECKS = [
  ["typecheck", "npm", ["run", "--silent", "typecheck"]],
  ["lint", "npm", ["run", "--silent", "lint"]],
  ["specs", "node", ["scripts/check-specs.mjs"]],
  ["i18n", "node", ["scripts/check-i18n-keys.mjs"]],
  ["descriptions", "node", ["scripts/check-description-snapshots.mjs"]],
  ["tokens", "node", ["scripts/check-tokens.mjs"]],
  ["contrast", "node", ["scripts/check-contrast.mjs"]],
  ["interaction", "node", ["scripts/check-interaction-surfaces.mjs"]],
  ["neighbors", "node", ["scripts/check-neighbor-candidates.mjs"]],
  ["version-branch", "node", ["scripts/check-version-branch.mjs"]],
  ["version-shipped", "node", ["scripts/check-version-shipped.mjs"]],
  ["test", "npm", ["run", "--silent", "test"]],
  // Its own output directory, so that running the gate while `npm run dev` is
  // up cannot replace the manifests the dev server is serving from. Sharing
  // `.next` cost a recording and a review round; see docs/TRAPS.md.
  ["build", "npm", ["run", "--silent", "build"], { NEXT_DIST_DIR: ".next-verify" }],
];

const only = process.argv.slice(2);
const selected = only.length ? CHECKS.filter(([name]) => only.includes(name)) : CHECKS;

if (only.length && selected.length === 0) {
  console.error(`Unknown check(s): ${only.join(", ")}`);
  console.error(`Available: ${CHECKS.map(([n]) => n).join(", ")}`);
  process.exit(2);
}

const failed = [];

for (const [name, cmd, args, env] of selected) {
  process.stdout.write(`\n\x1b[1m▸ ${name}\x1b[0m\n`);
  if (name === "build") {
    // Stale generated types from a deleted route make typecheck red on the next
    // run even though the source is fine. The verify build is ephemeral.
    rmSync(".next-verify", { recursive: true, force: true });
  }
  const { status } = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
  if (status !== 0) failed.push(name);
}

console.log("\n" + "─".repeat(56));

for (const [name] of selected) {
  const bad = failed.includes(name);
  console.log(`  ${bad ? "\x1b[31m✗" : "\x1b[32m✓"} ${name}\x1b[0m`);
}

if (failed.length) {
  console.error(
    `\n\x1b[31m✗ verify failed: ${failed.join(", ")}\x1b[0m\n` +
      `  Re-run one at a time with: node scripts/verify.mjs ${failed[0]}\n`,
  );
  process.exit(1);
}

console.log("\n\x1b[32m✓ verify passed\x1b[0m — paste this output when you report the work done.\n");
