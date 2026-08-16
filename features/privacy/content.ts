// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

export const privacyContent = {
  bannerTitle: "Cookies and storage",
  bannerBody:
    "We use essential cookies to keep you signed in. Optional analytics stay off until you accept.",
  bannerLink: "Privacy policy",
  acceptAll: "Accept",
  essentialOnly: "Essential only",
  title: "Privacy",
  intro:
    "This page will hold the full Datenschutzerklärung. Until legal review, this is what the app actually stores today.",
  stores: [
    "Account: email and user id (Supabase Auth), required to sign in.",
    "Session cookie: keeps you signed in.",
    "Review log (when built): your grades and card ids, append-only, owned by your account.",
    "Cookie choice: your accept/essential-only decision in this browser only.",
  ],
  contact: "Questions: use the address in the imprint when it is published.",
  accountLink:
    "Signed in? Open Account in the app menu to download or delete your data.",
} as const;
