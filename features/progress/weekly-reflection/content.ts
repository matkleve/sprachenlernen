export const reflectionVisualCopy = {
  beforeWeek: "Start of week",
  afterWeek: "Now",
  bandShiftCaption: (moved: number) =>
    `${moved} ${moved === 1 ? "word crossed" : "words crossed"} from shaky into held.`,
  bandBarsAria: (counts: { held: number; fragile: number; new: number }) =>
    `Held ${counts.held}, shaky ${counts.fragile}, new ${counts.new}.`,
  horizonCaption: "Reviews due per day over the next thirty days.",
  horizonAria: (bins: readonly { dayOffset: number; count: number }[]) => {
    const peak = bins.reduce((best, bin) => (bin.count > best.count ? bin : best), bins[0]!);
    return `Peak ${peak.count} reviews due on day ${peak.dayOffset}.`;
  },
  reviewActivityCaption: (count: number) =>
    count === 1 ? "review answer recorded this week" : "review answers recorded this week",
} as const;

export const weeklyReflectionCopy = {
  periodLabel: "This week",
  close: "Close",
  previous: "Previous",
  next: "Next",
  seeData: "See the data",
  cardStatus: (index: number, total: number) => `Card ${index} of ${total}`,
  rowLabel: "Weekly reflection",
  unreadLabel: "Unread reflection",
} as const;
