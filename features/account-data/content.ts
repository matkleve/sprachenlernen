// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

export const copy = {
  title: "Your data",
  intro:
    "Download everything the app has stored about your learning, or delete your account and all associated data.",
  exportHeading: "Download",
  exportCaption: "Plain JSON you can read without this app. The review log is enough to rebuild your schedule elsewhere.",
  scopeLabel: "What to include",
  scopeComplete: "Complete archive",
  scopeReviews: "Review log only",
  download: "Download JSON",
  deleteHeading: "Delete account",
  deleteCaption:
    "Permanently removes your account and every review you recorded. This cannot be undone.",
  deleteAction: "Delete account",
  confirmTitle: "Delete your account?",
  confirmBody:
    "Your account, review history, and all learning data will be permanently deleted. You will be signed out immediately.",
  confirmAction: "Yes, delete everything",
  cancel: "Cancel",
  exportFileName: "sprachenlernen-export.json",
} as const;

export type ExportScope = "complete" | "reviews";
