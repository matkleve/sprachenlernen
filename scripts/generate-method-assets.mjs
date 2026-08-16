#!/usr/bin/env node
/**
 * Placeholder SVG assets for skill-tier badges only.
 * Section header art lives as webp in public/assets/method-sections/ — do not
 * regenerate those here (they are editorial 3D renders, not placeholders).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const SKILLS = ["reading", "listening", "speaking", "writing"];
const TIERS = ["bronze", "silver", "gold", "platinum"];
const TIER_FILL = {
  bronze: "#b87333",
  silver: "#c0c5ce",
  gold: "#d4af37",
  platinum: "#e5e4e2",
};

function badgeSvg(skill, tier, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${tier} ${skill}">
  <path d="M12 16h72v52c0 8-16 20-36 20S12 76 12 68V16z" fill="${fill}" stroke="#3a3a3a" stroke-width="2"/>
  <circle cx="48" cy="42" r="14" fill="#ffffff" fill-opacity="0.25"/>
</svg>`;
}

const badgeDir = join(ROOT, "public/assets/skill-tier-badges");
mkdirSync(badgeDir, { recursive: true });

for (const skill of SKILLS) {
  for (const tier of TIERS) {
    const path = join(badgeDir, `${skill}-${tier}.svg`);
    writeFileSync(path, badgeSvg(skill, tier, TIER_FILL[tier]));
  }
}

console.log("Wrote skill-tier placeholder SVGs");
