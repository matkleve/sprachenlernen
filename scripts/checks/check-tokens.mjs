#!/usr/bin/env node
/**
 * Gate: no raw design values outside app/globals.css.
 *
 * Why this is a gate and not a guideline: a single hardcoded `#fff` does not
 * look like a bug — it looks fine, in light mode, on the machine of whoever
 * wrote it. It surfaces as "dark mode is broken on one card" weeks later, and
 * by then there are thirty of them. The only cheap moment to catch it is now.
 *
 * Escape hatch: put `token-check-ignore` in a comment on the same line, and say
 * why. Rare cases are real (an OG image, a third-party embed's required color).
 */

import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

const FILES = globSync("{app,components,features,lib}/**/*.{ts,tsx,css}", { cwd: ROOT }).filter(
  (f) =>
    !f.endsWith("globals.css") &&
    // Dev-only material skins — imported by globals.css; raw hex is intentional (T-PT0c).
    f !== "app/progression-skins.css" &&
    f !== "app/wood-textures.css",
);

const RULES = [
  {
    id: "hex-color",
    // #abc or #aabbcc, not followed by more hex (so #aabbccdd is caught too)
    pattern: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g,
    message: "raw hex color — add a token in app/globals.css and use its utility",
  },
  {
    id: "color-function",
    pattern: /\b(?:rgba?|hsla?|oklch)\(/g,
    message: "raw color function — add a token in app/globals.css",
  },
  {
    id: "arbitrary-color",
    // Tailwind arbitrary value carrying a color: text-[#fff], bg-[rgb(...)]
    pattern: /\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\()/g,
    message: "arbitrary color in a class — use a token utility",
  },
  {
    id: "arbitrary-z-index",
    pattern: /\bz-\[\d+\]/g,
    message: "arbitrary z-index — stacking order belongs in one place, not inline",
  },
  {
    id: "transition-all",
    pattern: /\btransition-all\b/g,
    message:
      "transition-all animates layout properties too — name the properties: transition-[background-color,transform]",
  },
  {
    id: "off-scale-duration",
    // The scale is 150 / 200 / 300 (docs/DESIGN-SYSTEM.md § Motion).
    pattern: /\bduration-(?!150\b|200\b|300\b)(?:\d+|\[[^\]]+\])/g,
    message: "off-scale duration — use duration-150, -200 or -300",
  },
  {
    id: "raw-easing",
    pattern: /\bease-\[|cubic-bezier\(/g,
    message: "raw easing — use the ease-out-soft token",
  },
];

let problems = 0;

for (const file of FILES) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");

  lines.forEach((line, i) => {
    if (line.includes("token-check-ignore")) return;

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);
      if (!match) continue;

      problems++;
      console.error(
        `✗ ${file}:${i + 1}  ${rule.message}\n    ${match[0]}  in: ${line.trim().slice(0, 100)}`,
      );
    }
  });
}

// --- token ↔ tailwind-merge parity ------------------------------------------
//
// The countermeasure to the trap in docs/TRAPS.md, automated. tailwind-merge
// only resolves conflicts for scales it knows about, so a token defined in
// globals.css but missing from lib/utils.ts silently loses the ability to be
// overridden by a caller — with no error and no visual clue. Relying on
// somebody remembering to edit both files is exactly what fails.

const THEME = readFileSync(join(ROOT, "app/globals.css"), "utf8");
const UTILS = readFileSync(join(ROOT, "lib/utils.ts"), "utf8");

const themeBlock = THEME.slice(THEME.indexOf("@theme"), THEME.indexOf("\n}\n"));

// Tailwind namespace → the `theme` key tailwind-merge uses for it.
const NAMESPACES = ["color", "radius", "shadow", "spacing", "ease"];

// Tokens Tailwind resolves itself; they need no entry in lib/utils.ts.
const BUILTIN = new Set(["font-sans", "font-serif", "font-mono"]);

for (const namespace of NAMESPACES) {
  const declared = [
    ...themeBlock.matchAll(new RegExp(`--${namespace}-([\\w-]+):`, "g")),
  ].map((m) => m[1]);

  const registered = UTILS.match(new RegExp(`${namespace}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";

  for (const token of declared) {
    if (BUILTIN.has(`${namespace}-${token}`)) continue;
    if (registered.includes(`"${token}"`)) continue;

    problems++;
    console.error(
      `✗ lib/utils.ts  --${namespace}-${token} is defined in globals.css but not registered\n` +
        `    Without it, cn() cannot resolve conflicts for that scale and a caller's override silently loses.\n` +
        `    Add "${token}" to the \`${namespace}\` array in extendTailwindMerge.`,
    );
  }
}

// --- every var(--token) reference resolves ----------------------------------
//
// A `var(--x)` naming a token that does not exist resolves to nothing, and the
// property is simply not applied. No error, no warning, no visual clue beyond
// "the transition does nothing" — which reliably sends people off refactoring
// the logic instead. Renaming or removing a token is how these appear.

const DEFINED = new Set([...THEME.matchAll(/(--[\w-]+):/g)].map((m) => m[1]));

for (const file of [...FILES, "app/globals.css"]) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");

  lines.forEach((line, i) => {
    for (const [, name] of line.matchAll(/var\((--[\w-]+)/g)) {
      if (DEFINED.has(name)) continue;

      problems++;
      console.error(
        `✗ ${file}:${i + 1}  var(${name}) names a token that does not exist\n` +
          `    It resolves to nothing and the property is silently dropped.`,
      );
    }
  });
}

// --- themeColor mirrors --color-canvas --------------------------------------
//
// app/layout.tsx has to repeat the canvas colour as literal hex, because the
// browser reads that <meta> before any CSS exists. Repetition is fine as long
// as it cannot drift, so the equality is asserted rather than trusted.

const LAYOUT = readFileSync(join(ROOT, "app/layout.tsx"), "utf8");
const darkBlock = THEME.slice(THEME.indexOf(':root[data-theme="dark"]'));

const canvas = {
  light: themeBlock.match(/--color-canvas:\s*(#[0-9a-fA-F]{3,8})/)?.[1],
  dark: darkBlock.match(/--color-canvas:\s*(#[0-9a-fA-F]{3,8})/)?.[1],
};

for (const [scheme, expected] of Object.entries(canvas)) {
  const declared = LAYOUT.match(
    new RegExp(`prefers-color-scheme:\\s*${scheme}[^}]*?color:\\s*"(#[0-9a-fA-F]{3,8})"`),
  )?.[1];

  if (declared?.toLowerCase() !== expected?.toLowerCase()) {
    problems++;
    console.error(
      `✗ app/layout.tsx  themeColor (${scheme}) is ${declared}, but --color-canvas is ${expected}\n` +
        `    The browser chrome would sit at a different shade than the page it frames.`,
    );
  }
}

if (problems) {
  console.error(`\n✗ tokens: ${problems} problem(s)`);
  process.exit(1);
}

console.log(
  `✓ tokens: ${FILES.length} files carry no raw design values; every token is merge-registered`,
);
