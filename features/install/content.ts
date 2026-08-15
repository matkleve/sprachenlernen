/** Copy for the Home Screen install surface. Contract: docs/specs/feature/pwa-install.md */
export const copy = {
  title: "Add to Home Screen",
  intro:
    "On iPhone, the Home Screen app only works correctly when you add it from the main website address — not from Methods, Words, or Progress.",
  whyHeading: "Why the main address",
  whyBody:
    "Apple ties the Home Screen app to the page you were on when you tapped Add to Home Screen. Add from the site root and every section works without Safari's bottom toolbar. Add from a sub-page and only that section (and its sub-pages) stay clean.",
  noButton:
    "iPhone does not allow websites to show an install button. You use Safari's Share menu → Add to Home Screen.",
  stepsHeading: "Steps (iPhone)",
  steps: [
    "Remove any existing Home Screen icon for this app.",
    "Open the main website in Safari (button below — not a bookmark to Methods or Words).",
    "Tap Share (square with arrow) → Add to Home Screen → Add.",
    "Open the app only from the new icon. Sign in if prompted.",
  ],
  openSite: "Open main website in Safari",
  openSiteAria: "Open the main website to add this app to your Home Screen",
  alreadySignedIn:
    "If you are signed in here in the browser, you can still add to Home Screen from this page — the Home Screen app will ask you to sign in again.",
  backToApp: "Back to the app",
} as const;
