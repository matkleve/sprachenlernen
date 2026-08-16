#!/usr/bin/env node
/**
 * Placeholder assets for method surfaces — skill-tier badges and section headers.
 * Editorial webp section art can replace the SVG placeholders later without
 * changing component code (update paths in section-graphic.ts only).
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

const SECTIONS = [
  { id: "reading", accent: "#c45c26" },
  { id: "listening", accent: "#2d6a9f" },
  { id: "speaking", accent: "#8b5a2b" },
  { id: "writing", accent: "#5c4d7a" },
  { id: "form", accent: "#4a6fa5" },
  { id: "vocabulary", accent: "#6b8e23" },
  { id: "world", accent: "#3d7a6b" },
  { id: "commitments", accent: "#7a5c3d" },
];

function badgeSvg(skill, tier, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${tier} ${skill}">
  <path d="M12 16h72v52c0 8-16 20-36 20S12 76 12 68V16z" fill="${fill}" stroke="#3a3a3a" stroke-width="2"/>
  <circle cx="48" cy="42" r="14" fill="#ffffff" fill-opacity="0.25"/>
</svg>`;
}

function sectionSvg(accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#2a2520" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="800" height="200" fill="url(#bg)"/>
  <path d="M-20 140 C180 40 320 160 520 80 S740 120 820 60" stroke="${accent}" stroke-width="12" fill="none" opacity="0.35"/>
  <path d="M0 180 C200 100 400 200 600 120 S760 160 800 100" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.12"/>
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

const sectionDir = join(ROOT, "public/assets/method-sections");
mkdirSync(sectionDir, { recursive: true });

for (const section of SECTIONS) {
  const path = join(sectionDir, `method-section-${section.id}.svg`);
  writeFileSync(path, sectionSvg(section.accent));
}

console.log("Wrote skill-tier and method-section placeholder SVGs");
