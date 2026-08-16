/**
 * Learner card report categories (UC-073). Contract:
 * docs/specs/feature/review-card-report.md
 */

export const REPORT_CATEGORIES = [
  "wrong-translation",
  "audio",
  "confusing",
  "not-relevant",
  "other",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_NOTE_MAX_LENGTH = 280;

export type ReportCardInput = {
  category?: ReportCategory | null;
  note?: string | null;
};

export function isReportCategory(value: string): value is ReportCategory {
  return (REPORT_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeReportNote(note: string | null | undefined): string | null {
  if (!note) return null;
  const trimmed = note.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, REPORT_NOTE_MAX_LENGTH);
}
