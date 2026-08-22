#!/usr/bin/env node
/**
 * Gate: every token pair that can appear together clears WCAG AA — in BOTH themes.
 * State-fill deltas and opacity composites use looser thresholds (see contrast-gate spec).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMPOSITE_PAIRS,
  EXEMPT,
  PAIRS,
  STATE_DELTAS,
} from "./contrast-pairs.mjs";
import { composite, contrast } from "../lib/color.mjs";

const CSS = join(import.meta.dirname, "../..", "app", "globals.css");

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

let failed = 0;
const rows = [];

function record(theme, kind, label, ratio, need, ok, use) {
  rows.push({
    theme,
    kind,
    label,
    ratio: `${ratio.toFixed(2)}:1`,
    need: `${need}:1`,
    ok: ok ? "ok" : "FAIL",
    use,
  });
  if (!ok) failed++;
}

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
    record(themeName, "pair", `${fg} on ${bg}`, ratio, min, ratio >= min, use);
  }

  for (const [from, to, min, use] of STATE_DELTAS) {
    if (!theme[from] || !theme[to]) {
      console.error(`✗ ${themeName}: unknown token in state delta ${from} → ${to}`);
      failed++;
      continue;
    }
    const ratio = contrast(theme[from], theme[to]);
    record(themeName, "state", `${from} → ${to}`, ratio, min, ratio >= min, use);
  }

  for (const [fg, bg, alpha, min, use] of COMPOSITE_PAIRS) {
    if (!theme[fg] || !theme[bg]) {
      console.error(`✗ ${themeName}: unknown token in composite ${fg} @ ${alpha} on ${bg}`);
      failed++;
      continue;
    }
    const blended = composite(theme[fg], theme[bg], alpha);
    const ratio = contrast(blended, theme[bg]);
    record(
      themeName,
      "composite",
      `${fg} @ ${Math.round(alpha * 100)}% on ${bg}`,
      ratio,
      min,
      ratio >= min,
      use,
    );
  }
}

const covered = new Set([
  ...PAIRS.flatMap(([fg, bg]) => [fg, bg]),
  ...STATE_DELTAS.flatMap(([from, to]) => [from, to]),
  ...COMPOSITE_PAIRS.flatMap(([fg, bg]) => [fg, bg]),
]);
const uncovered = Object.keys(light).filter((t) => !covered.has(t) && !EXEMPT.has(t));

for (const row of rows.filter((r) => r.ok === "FAIL")) {
  console.error(
    `✗ ${row.theme} [${row.kind}]: ${row.label} is ${row.ratio}, needs ${row.need} — ${row.use}`,
  );
}

if (uncovered.length) {
  console.error(
    `✗ tokens with no contrast coverage: ${uncovered.join(", ")}\n` +
      `  Add them to scripts/checks/contrast-pairs.mjs, or to EXEMPT if decoration only.`,
  );
  failed += uncovered.length;
}

if (process.env.VERBOSE || failed) {
  console.table(
    rows.map(({ theme, kind, label, ratio, need, ok }) => ({ theme, kind, label, ratio, need, ok })),
  );
}

if (failed) {
  console.error(`\n✗ contrast: ${failed} problem(s)`);
  process.exit(1);
}

console.log(
  `✓ contrast: ${rows.length} checks pass in both themes ` +
    `(${PAIRS.length} pairs, ${STATE_DELTAS.length} state deltas, ${COMPOSITE_PAIRS.length} composites per theme)`,
);
