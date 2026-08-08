/** Copy for the primitives demo. Text lives here, not inline in JSX. */

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
