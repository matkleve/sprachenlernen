#!/usr/bin/env node
/**
 * Gate: every token pair that can appear together clears WCAG AA — in BOTH themes.
 *
 * This catches the failure mode where a palette is tuned by eye in light mode
 * and the dark variant quietly drops below 4.5:1, because nobody re-checks a
 * color they did not change.
 *
 * Adding a token means adding its pairs to PAIRS below. A token with no pair
 * here is untested, so the script says so rather than silently passing.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = join(import.meta.dirname, "..", "app", "globals.css");

/** [foreground, background, minimum ratio, what it is used for] */
const PAIRS = [
  ["ink", "canvas", 4.5, "body text on the page"],
  ["ink", "surface", 4.5, "body text on a card"],
  ["ink", "surface-raised", 4.5, "body text on an elevated card"],
  ["muted", "canvas", 4.5, "secondary text on the page"],
  ["muted", "surface", 4.5, "secondary text on a card"],
  ["muted", "surface-raised", 4.5, "secondary text on an elevated card"],
  ["accent", "canvas", 4.5, "link text on the page"],
  ["accent", "surface", 4.5, "link text on a card"],
  ["accent-ink", "accent", 4.5, "label on a primary button"],
  ["accent-ink", "accent-deep", 4.5, "label on a hovered primary button"],
  ["ink", "accent-soft", 4.5, "text on an accent-tinted fill"],
  ["accent", "accent-soft", 3.0, "accent icon on its own tint"],
  ["danger", "surface", 4.5, "error text on a card"],
  ["danger-ink", "danger", 4.5, "label on a danger button"],
  ["danger-ink", "danger-deep", 4.5, "label on a hovered danger button"],
  ["ink", "danger-soft", 4.5, "text on a danger-tinted fill"],
  ["success-ink", "success", 4.5, "label on a success fill"],
  ["ink", "success-soft", 4.5, "text on a success-tinted fill"],
  ["line-strong", "surface", 3.0, "the border of a control (WCAG 1.4.11)"],
  ["line-strong", "canvas", 3.0, "the border of a control on the page"],
];

/** Tokens that are backgrounds/decoration only and need no contrast pair. */
const EXEMPT = new Set(["line"]);

// --- color math (WCAG 2.x relative luminance) -------------------------------

function parseHex(hex) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  if (full.length !== 6) throw new Error(`not a hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// --- extract the two themes from globals.css --------------------------------

function block(css, startPattern) {
  const start = css.search(startPattern);
  if (start === -1) return "";
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start, i);
  }
  return "";
}

function tokensIn(source) {
  const found = {};
  for (const [, name, value] of source.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    found[name] = value;
  }
  return found;
}

const css = readFileSync(CSS, "utf8");
const light = tokensIn(block(css, /@theme\s*\{/));
const dark = { ...light, ...tokensIn(block(css, /:root\[data-theme="dark"\]\s*\{/)) };

if (Object.keys(light).length === 0) {
  console.error("✗ no --color-* tokens found in app/globals.css — did the file move?");
  process.exit(1);
}

// --- run --------------------------------------------------------------------

let failed = 0;
const rows = [];

for (const [themeName, theme] of [
  ["light", light],
  ["dark", dark],
]) {
  for (const [fg, bg, min, use] of PAIRS) {
    if (!theme[fg] || !theme[bg]) {
      console.error(`✗ ${themeName}: unknown token in pair ${fg} / ${bg}`);
      failed++;
      continue;
    }
    const ratio = contrast(theme[fg], theme[bg]);
    const ok = ratio >= min;
    if (!ok) failed++;
    rows.push({
      theme: themeName,
      pair: `${fg} on ${bg}`,
      ratio: `${ratio.toFixed(2)}:1`,
      need: `${min}:1`,
      ok: ok ? "ok" : "FAIL",
      use,
    });
  }
}

// Every token should be covered by at least one pair, or it is untested.
const covered = new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]));
const uncovered = Object.keys(light).filter((t) => !covered.has(t) && !EXEMPT.has(t));

for (const row of rows.filter((r) => r.ok === "FAIL")) {
  console.error(
    `✗ ${row.theme}: ${row.pair} is ${row.ratio}, needs ${row.need} — ${row.use}`,
  );
}

if (uncovered.length) {
  console.error(
    `✗ tokens with no contrast pair: ${uncovered.join(", ")}\n` +
      `  Add them to PAIRS in scripts/check-contrast.mjs, or to EXEMPT if they are decoration only.`,
  );
  failed += uncovered.length;
}

if (process.env.VERBOSE || failed) {
  // `use` is prose for the failure message, not a table column.
  console.table(rows.map(({ theme, pair, ratio, need, ok }) => ({ theme, pair, ratio, need, ok })));
}

if (failed) {
  console.error(`\n✗ contrast: ${failed} problem(s)`);
  process.exit(1);
}

console.log(`✓ contrast: ${rows.length} pairs pass in both themes`);
