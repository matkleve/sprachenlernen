/** Copy for the profile surface. Contract: docs/specs/page/profile.md */
export const copy = {
  title: "Profile",
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
} as const;
