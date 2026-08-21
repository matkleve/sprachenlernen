#!/usr/bin/env node
/**
 * Gate: German copy addresses the reader as `du`, never as `Sie`.
 *
 * Rule and rationale: docs/COPY-VOICE.md § 1. This is enforced rather than
 * written down because it already failed once by drift, not by decision — the
 * landing page said "du", the signed-in app said "Sie", and no single change
 * introduced the split. A rule with no gate is a rule that decays one string
 * at a time.
 *
 * Only German is checked. English has no T-V distinction, so there is nothing
 * to keep consistent there.
 *
 * Scope note: `data/i18n/method-catalogue/de.json` is the *source* for the
 * generated `methodMenu.entries` block, so it is checked too — otherwise a
 * `Sie` reintroduced there would pass this gate and then be synced into
 * messages/de.json.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(root, "..");

const FILES = ["messages/de.json", "data/i18n/method-catalogue/de.json"];

/**
 * Capitalised polite forms. Word-boundary matched so `Sieger`, `Ihre` inside a
 * larger word, and lowercase `sie`/`ihre` (the ordinary third person, which is
 * fine) do not trip it.
 */
const POLITE = /\b(Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/;

/**
 * Sentence-initial `Sie`/`Ihr` cannot be told apart from the third person by
 * regex ("Sie sind Muttersprachler" vs. "Sie liest jeden Tag"). List such a key
 * here with the reason rather than weakening the pattern for everything — and
 * check the English source before adding one, which settles it in a second.
 */
const ALLOWED_KEYS = new Set([
  // "Beispiel: Sie liest jeden Tag ein bisschen." — a sample sentence in the
  // third person ("She reads a little every day"), not the polite form. The
  // English source confirms it. Sentence-initial "Sie" is the one case regex
  // cannot resolve, so it is listed rather than pattern-matched away.
  "messages/de.json:learnerWorld.preview.general",
]);

function leaves(value, prefix = "") {
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leaves(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return typeof value === "string" ? [[prefix, value]] : [];
}

const offenders = [];

for (const file of FILES) {
  const data = JSON.parse(readFileSync(path.join(repoRoot, file), "utf8"));
  for (const [key, text] of leaves(data)) {
    if (ALLOWED_KEYS.has(`${file}:${key}`)) continue;
    const hit = text.match(POLITE);
    if (hit) offenders.push({ file, key, word: hit[0], text });
  }
}

if (offenders.length > 0) {
  console.error(
    `German copy must address the reader as "du" (docs/COPY-VOICE.md § 1).\n` +
      `${offenders.length} string(s) still use the polite form:\n`,
  );
  for (const { file, key, word, text } of offenders) {
    console.error(`  ${file} → ${key}   ("${word}")`);
    console.error(`    ${text.slice(0, 120)}${text.length > 120 ? "…" : ""}`);
  }
  process.exit(1);
}

console.log("i18n address ok — German copy is consistently informal");
