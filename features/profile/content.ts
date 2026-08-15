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
} as const;
