/** Copy for the profile surface. Contract: docs/specs/page/profile.md */
export const copy = {
  title: "Profile",
  spokenHeading: "Language you speak",
  spokenCaption:
    "Menus, buttons, and the text that describes words on cards. Changing this does not reset your learning progress.",
  spokenError: "Could not load your spoken language.",
  spokenChangeError: "Could not change your spoken language. Nothing changed.",
  languagesHeading: "Languages",
  languagesCaption: "What you are learning. The one in focus decides what the app shows you.",
  active: "Active",
  makeActive: "Switch to this",
  addLanguage: "Add a language",
  noneYet: "You have not chosen a language yet.",
  chooseFirst: "Choose a language",
  languagesError: "Could not load your languages.",
  switchError: "Could not switch language. Nothing changed.",
  standing: (held: number, poolSize: number) =>
    `${held} of ${poolSize} starter words held stably`,
  viewProgress: "View on Progress",
  signOut: "Sign out",
  appHeading: "App",
  appCaption:
    "The version running on this device. Check after a deploy if something looks out of date.",
  runningVersion: "Running version",
  checkForUpdates: "Check for updates",
  updateAvailable: (version: string) => `Update available (${version})`,
  reload: "Reload",
  reloadAria: (nextVersion: string, currentVersion: string) =>
    `Reload to update from ${currentVersion} to ${nextVersion}`,
  homeScreenHeading: "Home screen app (iPhone)",
  homeScreenCaption:
    "On iPhone, add this app from the main website address so Methods, Words, and Progress all work without Safari's bottom toolbar. Apple does not allow an install button — you use Share → Add to Home Screen.",
  homeScreenActive: "Opened from your Home Screen icon",
  homeScreenScopeHeading: "Which address to use",
  homeScreenScopeCaption:
    "The path in Safari when you tap Add to Home Screen decides which sections stay clean. Use the main website only.",
  homeScreenScopeRows: [
    { path: "/", covers: "Methods, Words, and Progress", recommended: true },
    { path: "/methods", covers: "Methods only", recommended: false },
    { path: "/words", covers: "Words only", recommended: false },
    { path: "/progress", covers: "Progress only", recommended: false },
  ],
  homeScreenInstallButton: "Install instructions",
  homeScreenMainSiteButton: "Open main website",
  homeScreenReinstall:
    "If the bottom toolbar appears on some pages, remove the Home Screen icon, open the main website in Safari, and add the app again from there — not from a section page.",
} as const;
