export const copy = {
  hubTitle: "Safari / PWA bisect",
  hubIntro:
    "Find what triggers the bottom chrome on iPhone PWA. Note the Bottom inset value on each page and whether the pill looks low or lifted.",
  hubBisectHeading: "Body bisect (add sections step by step)",
  hubWords: "Words bisect",
  hubProgress: "Progress bisect",
  hubNavAbHeading: "Navigation A/B — open route directly",
  hubNavAbIntro:
    "If only this hub looks correct but Methods / Words / Progress do not, test whether the trigger is how you arrive on the page — typed link vs bottom pill tap.",
  hubDirectMethods: "Open /methods directly (full page load)",
  hubDirectMethodsMirror: "Open /methods-mirror directly",
  hubDirectWords: "Open /words directly",
  hubDirectProgress: "Open /progress directly",
  hubNavAbSteps:
    "Steps: (1) Note inset here on the hub. (2) Tap a direct link above — inset after load? (3) Go back to hub. (4) Open the same route via the bottom pill — same or different? Report: direct OK but pill bad = navigation trigger, not page body.",
  bannerTitle: "Safari body bisect",
  levelLabel: (level: number, max: number, description: string) =>
    `Level ${level}/${max} — ${description}`,
  previous: "Previous level",
  next: "Next level",
  hubLink: "Bisect hub",
  insetLabel: "Bottom inset",
  modeLabel: "Display mode",
  modeStandalone: "Standalone (Home Screen)",
  modeBrowser: "In-browser (not Home Screen)",
  modeWarning:
    "Install from the site root (/) — see Profile → Home screen app or /install.",
  wordsMinimal:
    "Bisect level 0 — one paragraph inside ShellPageContent, same shape as Methods intro. If this already looks wrong vs Methods, the cause is route/title not body sections below.",
  progressMinimal:
    "Bisect level 0 — one paragraph inside ShellPageContent. Compare to Methods and to Words bisect level 0.",
} as const;
