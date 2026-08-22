#!/usr/bin/env node
/**
 * Gate: no secret carries `NEXT_PUBLIC_`, and the elevated key stays inside
 * its seam. BACKEND.md §8 asked for the first of these — "a grep is enough" —
 * and the grep was never written, so the rule lived only in prose.
 *
 * Two checks:
 *
 *  1. **No secret-shaped name is exposed to the browser.** Anything prefixed
 *     `NEXT_PUBLIC_` is inlined into the client bundle in plain text. A name
 *     containing SECRET / SERVICE_ROLE / PASSWORD / TOKEN / PRIVATE with that
 *     prefix is a credential shipped to every visitor.
 *
 *  2. **`SUPABASE_SERVICE_ROLE_KEY` is read only where it may be read.** The
 *     key bypasses row-level security entirely, so the set of files that touch
 *     it is the blast radius, and it should be short enough to read. It is an
 *     allowlist rather than a directory rule because "server-only" is not a
 *     property a grep can see — `lib/db/admin-client.ts` is server-only, and a
 *     Client Component importing it would be too, right up until it shipped.
 */

import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

/** Files permitted to read the elevated key. Adding one is a review decision. */
const SERVICE_ROLE_ALLOWLIST = new Set([
  // The seam itself — the only runtime path (ADR-0007, .env.example).
  "lib/db/admin-client.ts",
  // The BACKEND.md §8 policy test: it must create and delete real users.
  "lib/db/access-control.test.ts",
  // Operator entry points, run by hand against a scratch project. Each one
  // gates itself on an explicit env flag or refuses a production environment.
  "lib/db/backfill-task-state.run.test.ts",
  "lib/db/import-app-texts.run.test.ts",
  "scripts/smoke/smoke-progress.mjs",
  "scripts/smoke/smoke-progress-browser.mjs",
  "scripts/build/create-test-user.mjs",
  // This gate.
  "scripts/checks/check-secrets.mjs",
]);

const SECRET_WORDS = /(SECRET|SERVICE_ROLE|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN)/;
const PUBLIC_SECRET = new RegExp(`NEXT_PUBLIC_[A-Z0-9_]*${SECRET_WORDS.source}`);

const files = globSync("**/*.{ts,tsx,mjs,js,json}", {
  cwd: ROOT,
  exclude: (name) =>
    name === "node_modules" ||
    name === ".next" ||
    name === ".next-verify" ||
    name === "package-lock.json",
});

const problems = [];

for (const file of files) {
  const text = readFileSync(join(ROOT, file), "utf8");

  for (const [index, line] of text.split("\n").entries()) {
    const exposed = line.match(PUBLIC_SECRET);
    if (exposed) {
      problems.push(
        `✗ ${file}:${index + 1}  ${exposed[0]} — NEXT_PUBLIC_ ships to the browser in plain text`,
      );
    }

    if (line.includes("SUPABASE_SERVICE_ROLE_KEY") && !SERVICE_ROLE_ALLOWLIST.has(file)) {
      problems.push(
        `✗ ${file}:${index + 1}  reads SUPABASE_SERVICE_ROLE_KEY — the key bypasses RLS.\n` +
          `    Allowed in: ${[...SERVICE_ROLE_ALLOWLIST].join(", ")}\n` +
          `    Widening that list is a Sensitive change (AGENTS.md).`,
      );
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n✗ check:secrets — ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(`✓ check:secrets — ${files.length} files, no exposed secret`);
