export const copy = {
  hubTitle: "Safari / PWA bisect",
  hubIntro:
    "Find which page body section triggers the bottom chrome asymmetry on iPhone PWA. Start on Methods (baseline), then open each level — note when the pill jumps up.",
  hubWords: "Words bisect",
  hubProgress: "Progress bisect",
  bannerTitle: "Safari body bisect",
  levelLabel: (level: number, max: number, description: string) =>
    `Level ${level}/${max} — ${description}`,
  previous: "Previous level",
  next: "Next level",
  hubLink: "Bisect hub",
  insetLabel: "Bottom inset",
  wordsMinimal:
    "Bisect level 0 — one paragraph inside ShellPageContent, same shape as Methods intro. If this already looks wrong vs Methods, the cause is route/title not body sections below.",
  progressMinimal:
    "Bisect level 0 — one paragraph inside ShellPageContent. Compare to Methods and to Words bisect level 0.",
} as const;
