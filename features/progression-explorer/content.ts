/**
 * Dev-tool copy. Contract: docs/specs/page/progression-explorer.md
 *
 * English literals, not `messages/*.json`: `/dev/*` is owner tooling and is
 * never translated — the same choice `features/design-explorer/content.ts` and
 * `features/brand-explorer/content.ts` already made. Translating it would put
 * strings in front of the i18n gate that no learner will ever read.
 */

export const page = {
  eyebrow: "Dev",
  title: "Progression explorer",
  intro:
    "One control, nine stages. Chapters change the whole token set; stages add material skins (wood, plaster, night sky), texture, radius, and depth on top of the chapter you are in. Nothing here is wired to learner data — this exists to answer whether a single step is worth noticing.",
  stageLabel: "Stage",
  chapterHeading: "Chapter",
  preview: {
    shellTitle: "Methods",
    eyebrow: "Listening · secondary",
    methodTitle: "Narrow listening",
    methodBody:
      "Three short episodes on one topic. The vocabulary repeats itself, so the second one is easier than the first.",
    methodChips: ["15–20 min", "Own material", "B1"],
    reviewPrompt: "el desarrollo",
    reviewHint: "Tap a grade — this is the surface you will see most.",
    grades: { again: "Again", hard: "Hard", good: "Good", easy: "Easy" },
    navItems: ["Methods", "Words", "Progress"],
    fieldLabel: "Paste your own text",
    fieldPlaceholder: "Una mañana de verano…",
    primary: "Start",
    secondary: "Keep in library",
    statLabel: "Stable words",
    statValue: "1,240",
    statCaption: "Block 4 · 760 to go",
  },
} as const;
