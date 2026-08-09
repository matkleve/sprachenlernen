/** Copy for the primitives demo. Text lives here, not inline in JSX. */

/**
 * The `/primitives` route itself. This is the starter's worked example, kept
 * on purpose: `docs/STATE.md` cites the item picker as *the* demonstration of
 * state coherence and `docs/specs/README.md` indexes it, so deleting the code
 * would cost the docs their only worked example (T-B5).
 */
export const page = {
  title: "Primitives and worked examples",
  intro:
    "The components this project builds with, and the state-coherence example the documentation points at. None of this is the product — it is kept because no product feature demonstrates these patterns yet.",
  buttonsHeading: "Buttons",
  workedExampleHeading: "Worked example — one source, many surfaces",
  primitivesHeading: "Primitives",
} as const;

export const copy = {
  nameLabel: "Name",
  nameHint: "As it should appear to other people.",
  teamLabel: "Team",
  teamPlaceholder: "Choose…",
  teamError: "Enter a name first.",
  notesLabel: "Notes",
  notesPlaceholder: "Anything worth remembering.",
  tableCaption: "Records assigned to you",
  colItem: "Record",
  colOwner: "Owner",
  deleteAction: "Delete everything",
  confirmTitle: "Delete everything?",
  confirmBody: "This removes all records permanently. It cannot be undone.",
  cancel: "Cancel",
  confirm: "Delete",
} as const;

export const sampleRows = [
  { id: "REC-001", owner: "Design" },
  { id: "REC-002", owner: "Engineering" },
];
