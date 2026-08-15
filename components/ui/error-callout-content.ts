/** Copy for ErrorCallout. Contract: docs/specs/component/error-callout.md */
export const copy = {
  referenceLabel: "Reference",
  referenceHint:
    "Quote this id when you ask for help — it matches the line in the server log.",
  copyDetails: "Copy details",
  copied: "Copied",
  technicalDetails: "Technical details",
  codeLabel: "Code",
  developerLabel: "Developer",
} as const;

export type ErrorReportFields = {
  userMessage: string;
  nextStep?: string;
  referenceId: string;
  code?: string;
  developerMessage?: string;
};

export function formatErrorReport(fields: ErrorReportFields): string {
  const lines = [fields.userMessage];
  if (fields.nextStep) lines.push(fields.nextStep);
  lines.push(`${copy.referenceLabel}: ${fields.referenceId}`);
  if (fields.code) lines.push(`${copy.codeLabel}: ${fields.code}`);
  if (fields.developerMessage) lines.push(`${copy.developerLabel}: ${fields.developerMessage}`);
  return lines.join("\n");
}
