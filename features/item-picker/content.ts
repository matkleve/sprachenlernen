/**
 * Copy and sample data for the item picker.
 *
 * Text lives here rather than inline in JSX so it can be reviewed in one place,
 * reused, and later handed to a translation pipeline without touching markup.
 */

export type Item = {
  id: string;
  title: string;
  body: string;
};

export const copy = {
  listLabel: "Items",
  emptyTitle: "Nothing selected",
  emptyBody: "Pick an item from the list to see its details here.",
} as const;

export const sampleItems: Item[] = [
  {
    id: "spec",
    title: "Specs are the contract",
    body: "Code implements what the spec says. When they disagree, one of them is wrong — and it gets fixed in the same change, not the next one.",
  },
  {
    id: "class",
    title: "Ceremony scales with risk",
    body: "A typo fix and a change to how data is deleted do not deserve the same process. Declaring a change class up front is what keeps the heavy path credible.",
  },
  {
    id: "coherence",
    title: "One source, many surfaces",
    body: "Everything you see here derives from a single selectedId. No surface holds its own copy, so no surface can fall behind another.",
  },
];
