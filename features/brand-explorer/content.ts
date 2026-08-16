export const page = {
  title: "Brand explorer",
  intro:
    "Five app-mark directions derived from Warm Scholar and the shipped PWA placeholder. Compare at favicon, header, and Home Screen sizes before promoting a direction with scripts/sync-brand-assets.mjs.",
  selectedBanner: "Your current choice",
  chooseLabel: "Choose this direction",
  chosenLabel: "Selected",
  shippedLabel: "Shipped",
  chips: {
    basis: "Basis",
  },
  preview: {
    sizes: "Size previews",
    lockup: "Header lockup",
    safeZone: "Maskable safe zone (80%)",
    wordmark: "Sprachenlernen",
  },
  syncHint:
    "To ship a direction: node scripts/sync-brand-assets.mjs <direction-id>",
} as const;
