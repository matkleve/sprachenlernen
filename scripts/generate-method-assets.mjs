#!/usr/bin/env node
/**
 * Placeholder SVG assets for method section headers and skill-tier badges.
 * Replace with final art (webp or svg) when exported from the approved grid.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SECTIONS = [
  ["reading", "#6b5344"],
  ["listening", "#44566b"],
  ["speaking", "#6b4f44"],
  ["writing", "#4f6b52"],
  ["form", "#5a5a6b"],
  ["vocabulary", "#6b5a44"],
  ["world", "#4f5a6b"],
  ["commitments", "#5a6b5a"],
];

const SKILLS = ["reading", "listening", "speaking", "writing"];
const TIERS = ["bronze", "silver", "gold", "platinum"];
const TIER_FILL = {
  bronze: "#b87333",
  silver: "#c0c5ce",
  gold: "#d4af37",
  platinum: "#e5e4e2",
};

function sectionSvg(name, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="800" height="320" fill="url(#g)"/>
  <circle cx="620" cy="90" r="120" fill="${color}" fill-opacity="0.15"/>
  <circle cx="180" cy="240" r="80" fill="${color}" fill-opacity="0.1"/>
</svg>`;
}

function badgeSvg(skill, tier, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${tier} ${skill}">
  <path d="M12 16h72v52c0 8-16 20-36 20S12 76 12 68V16z" fill="${fill}" stroke="#3a3a3a" stroke-width="2"/>
  <circle cx="48" cy="42" r="14" fill="#ffffff" fill-opacity="0.25"/>
</svg>`;
}

const sectionDir = join(ROOT, "public/assets/method-sections");
const badgeDir = join(ROOT, "public/assets/skill-tier-badges");
mkdirSync(sectionDir, { recursive: true });
mkdirSync(badgeDir, { recursive: true });

for (const [section, color] of SECTIONS) {
  const path = join(sectionDir, `method-section-${section}.svg`);
  writeFileSync(path, sectionSvg(section, color));
}

for (const skill of SKILLS) {
  for (const tier of TIERS) {
    const path = join(badgeDir, `${skill}-${tier}.svg`);
    writeFileSync(path, badgeSvg(skill, tier, TIER_FILL[tier]));
  }
}

console.log("Wrote section and skill-tier placeholder SVGs");
