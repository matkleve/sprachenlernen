#!/usr/bin/env node
/**
 * Rewrite links after study doc migration. Idempotent.
 */
import { globSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

/** @type {Array<[string, string]>} old → new (substring replace) */
const REPLACEMENTS = [
  ["study/01-duolingo.md", "study/STUDY-001-duolingo.md"],
  ["study/02-evidence.md", "study/STUDY-002-evidence.md"],
  ["study/03-level-model.md", "study/STUDY-003-level-model.md"],
  ["study/04-flashcards-srs.md", "study/STUDY-004-flashcards-srs.md"],
  ["study/05-input-reading-listening.md", "study/STUDY-005-input-reading-listening.md"],
  ["study/06-production.md", "study/STUDY-006-production.md"],
  ["study/07-offline-and-paper.md", "study/STUDY-007-offline-and-paper.md"],
  ["study/08-motivation.md", "study/STUDY-008-motivation.md"],
  ["study/09-feature-catalogue.md", "backlog/BL-009-feature-catalogue.md"],
  ["study/10-antipatterns.md", "study/STUDY-009-antipatterns.md"],
  ["study/11-roadmap-open-questions.md", "backlog/BL-011-roadmap-open-questions.md"],
  ["study/12-method-cards.md", "study/STUDY-010-method-cards.md"],
  ["study/13-pronunciation-perception.md", "study/STUDY-011-pronunciation-perception.md"],
  ["study/14-accessibility.md", "study/STUDY-012-accessibility.md"],
  ["study/15-landscape.md", "study/STUDY-013-landscape.md"],
  ["study/16-further-findings.md", "study/STUDY-014-further-findings.md"],
  ["study/17-own-content.md", "study/STUDY-015-own-content.md"],
  ["study/18-language-kit.md", "study/STUDY-016-language-kit.md"],
  ["study/19-milestones-and-map.md", "study/STUDY-017-milestones-and-map.md"],
  ["study/20-speaking-and-sentences.md", "study/STUDY-018-speaking-and-sentences.md"],
  ["study/21-method-catalogue-and-context.md", "study/STUDY-019-method-catalogue-and-context.md"],
  ["study/22-visual-design.md", "study/STUDY-020-visual-design.md"],
  ["study/23-how-an-exercise-runs.md", "study/STUDY-021-how-an-exercise-runs.md"],
  ["study/24-speaking-as-the-goal.md", "study/STUDY-022-speaking-as-the-goal.md"],
  ["study/25-why-it-does-not-feel-productive.md", "study/STUDY-023-why-it-does-not-feel-productive.md"],
  ["study/26-readiness-and-difficulty.md", "study/STUDY-024-readiness-and-difficulty.md"],
  ["study/27-method-badges.md", "study/STUDY-025-method-badges.md"],
  ["study/28-mobile-desktop-layout.md", "reviews/design/DR-028-mobile-desktop-layout.md"],
  ["study/29-ios-inset-by-route.md", "qa/QA-029-ios-inset-by-route.md"],
  ["study/30-notifications-and-reflections.md", "study/STUDY-026-notifications-and-reflections.md"],
  ["study/31-ios-safari-pwa-test-report.md", "qa/QA-031-ios-safari-pwa-test-report.md"],
  ["study/32-pwa-profile-ux.md", "reviews/design/DR-032-pwa-profile-ux.md"],
  ["study/33-skill-tier-badges-exploration.md", "reviews/design/DR-033-skill-tier-badges-exploration.md"],
  ["study/33-profile-section-navigation.md", "reviews/design/DR-034-profile-section-navigation.md"],
  ["study/34-review-report-and-acknowledgement-ux.md", "reviews/design/DR-035-review-report-and-acknowledgement-ux.md"],
  ["study/35-logo-and-pwa-icon-exploration.md", "explorations/EXP-035-logo-and-pwa-icon-exploration.md"],
  ["study/36-method-surfaces-property-audit.md", "reviews/design/DR-036-method-surfaces-property-audit.md"],
  ["study/37-content-and-method-setup-ux.md", "reviews/design/DR-037-content-and-method-setup-ux.md"],
  ["study/38-landing-page-update.md", "explorations/EXP-038-landing-page-update.md"],
  ["study/39-method-section-graphics-brief.md", "explorations/EXP-039-method-section-graphics-brief.md"],
  ["study/39-material-units-and-listening-defer.md", "study/STUDY-027-material-units-and-listening-defer.md"],
  ["study/40-method-card-visual-polish.md", "reviews/design/DR-040-method-card-visual-polish.md"],
  ["study/41-practice-surface-ux.md", "reviews/design/DR-041-practice-surface-ux.md"],
  ["study/42-method-usefulness-ux-audit.md", "reviews/design/DR-042-method-usefulness-ux-audit.md"],
  ["study/42-exercise-mobile-fit-frame.md", "reviews/design/DR-043-exercise-mobile-fit-frame.md"],
  ["study/43-early-foundation-sessions.md", "study/archive/ARCH-043-early-foundation-sessions.md"],
  ["study/44-foundation-phase-expert-review.md", "study/archive/ARCH-044-foundation-phase-expert-review.md"],
  ["study/45-method-duration-variants.md", "study/archive/ARCH-045-method-duration-variants.md"],
  ["study/46-method-length-and-level-matched-content.md", "study/archive/ARCH-046-method-length-and-level-matched-content.md"],
  ["study/48-content-licensing-and-adaptation.md", "study/archive/ARCH-048-content-licensing-and-adaptation.md"],
  ["study/sources.md", "study/STUDY-sources.md"],
  // Relative within study/ cross-links (longest basename first)
  ["43-early-foundation-sessions.md", "archive/ARCH-043-early-foundation-sessions.md"],
  ["44-foundation-phase-expert-review.md", "archive/ARCH-044-foundation-phase-expert-review.md"],
  ["45-method-duration-variants.md", "archive/ARCH-045-method-duration-variants.md"],
  ["46-method-length-and-level-matched-content.md", "archive/ARCH-046-method-length-and-level-matched-content.md"],
  ["48-content-licensing-and-adaptation.md", "archive/ARCH-048-content-licensing-and-adaptation.md"],
  ["39-material-units-and-listening-defer.md", "STUDY-027-material-units-and-listening-defer.md"],
  ["39-method-section-graphics-brief.md", "../explorations/EXP-039-method-section-graphics-brief.md"],
  ["25-why-it-does-not-feel-productive.md", "STUDY-023-why-it-does-not-feel-productive.md"],
  ["26-readiness-and-difficulty.md", "STUDY-024-readiness-and-difficulty.md"],
  ["24-speaking-as-the-goal.md", "STUDY-022-speaking-as-the-goal.md"],
  ["21-method-catalogue-and-context.md", "STUDY-019-method-catalogue-and-context.md"],
  ["03-level-model.md", "STUDY-003-level-model.md"],
  ["04-flashcards-srs.md", "STUDY-004-flashcards-srs.md"],
  ["05-input-reading-listening.md", "STUDY-005-input-reading-listening.md"],
  ["08-motivation.md", "STUDY-008-motivation.md"],
  ["02-evidence.md", "STUDY-002-evidence.md"],
  ["01-duolingo.md", "STUDY-001-duolingo.md"],
  ["06-production.md", "STUDY-006-production.md"],
  ["07-offline-and-paper.md", "STUDY-007-offline-and-paper.md"],
  ["10-antipatterns.md", "STUDY-009-antipatterns.md"],
  ["12-method-cards.md", "STUDY-010-method-cards.md"],
  ["13-pronunciation-perception.md", "STUDY-011-pronunciation-perception.md"],
  ["14-accessibility.md", "STUDY-012-accessibility.md"],
  ["15-landscape.md", "STUDY-013-landscape.md"],
  ["16-further-findings.md", "STUDY-014-further-findings.md"],
  ["17-own-content.md", "STUDY-015-own-content.md"],
  ["18-language-kit.md", "STUDY-016-language-kit.md"],
  ["19-milestones-and-map.md", "STUDY-017-milestones-and-map.md"],
  ["20-speaking-and-sentences.md", "STUDY-018-speaking-and-sentences.md"],
  ["22-visual-design.md", "STUDY-020-visual-design.md"],
  ["23-how-an-exercise-runs.md", "STUDY-021-how-an-exercise-runs.md"],
  ["27-method-badges.md", "STUDY-025-method-badges.md"],
  ["30-notifications-and-reflections.md", "STUDY-026-notifications-and-reflections.md"],
  ["33-skill-tier-badges-exploration.md", "../reviews/design/DR-033-skill-tier-badges-exploration.md"],
  ["34-review-report-and-acknowledgement-ux.md", "../reviews/design/DR-035-review-report-and-acknowledgement-ux.md"],
  ["36-method-surfaces-property-audit.md", "../reviews/design/DR-036-method-surfaces-property-audit.md"],
  ["37-content-and-method-setup-ux.md", "../reviews/design/DR-037-content-and-method-setup-ux.md"],
  ["sources.md", "STUDY-sources.md"],
];

REPLACEMENTS.sort((a, b) => b[0].length - a[0].length);

const SKIP = new Set(["scripts/migrate-study-docs.mjs", "scripts/docs/study-frontmatter.mjs", "scripts/docs/study-link-rewrite.mjs"]);

const files = globSync("**/*.{md,ts,tsx,mjs,js,json,py}", {
  cwd: ROOT,
  ignore: ["node_modules/**", ".next/**", "package-lock.json"],
});

let changed = 0;
for (const rel of files) {
  if (SKIP.has(rel)) continue;
  const path = join(ROOT, rel);
  if (!statSync(path).isFile()) continue;
  let text = readFileSync(path, "utf8");
  const before = text;
  for (const [from, to] of REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  if (text !== before) {
    writeFileSync(path, text);
    changed++;
  }
}

console.log(`Rewrote links in ${changed} files.`);
