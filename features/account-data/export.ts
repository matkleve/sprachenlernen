import type { Account } from "@/lib/db/auth";
import type { CardContentFlagRow } from "@/lib/db/card-content-flags";
import type { LearnerLanguage } from "@/lib/db/learning-languages";
import type { ReviewLogRow } from "@/lib/db/review-log";
import type { TaskStateRow } from "@/lib/task-from-state";
import type { Source } from "@/lib/coverage";

import type { ExportScope } from "./content";

/**
 * Contract: docs/specs/feature/account-data.md, UC-024.
 *
 * "Complete archive" means every table this account owns, not the review log
 * with an email attached. UC-024's condition is that the export be "complete
 * enough that the schedule could be rebuilt elsewhere" — the review log alone
 * satisfies the *rebuild*, but leaves the learner's own writing (saved texts,
 * report notes) and their settings on the server with no way to take them.
 *
 * Keys are the table names, deliberately: an export whose shape mirrors the
 * schema is one a reader can line up against `supabase/migrations/` without
 * this app. That is the "documented, plain, readable" half of UC-024.
 */

/** Everything the complete archive carries beyond the review log. */
export type AccountArchive = {
  taskStates: TaskStateRow[];
  sources: Source[];
  flags: CardContentFlagRow[];
  languages: LearnerLanguage[];
  spokenLanguage: string;
};

export type ExportPayload =
  | { review_log: ReviewLogRow[] }
  | {
      account: Pick<Account, "email"> & { spoken_language: string };
      review_log: ReviewLogRow[];
      task_state: TaskStateRow[];
      content_sources: Source[];
      card_content_flag: CardContentFlagRow[];
      learner_language: LearnerLanguage[];
      exported_at: string;
    };

export function buildExportPayload(
  scope: ExportScope,
  account: Account,
  reviews: ReviewLogRow[],
  archive?: AccountArchive,
): ExportPayload {
  if (scope === "reviews") {
    return { review_log: reviews };
  }

  return {
    account: { email: account.email, spoken_language: archive?.spokenLanguage ?? "" },
    review_log: reviews,
    task_state: archive?.taskStates ?? [],
    content_sources: archive?.sources ?? [],
    card_content_flag: archive?.flags ?? [],
    learner_language: archive?.languages ?? [],
    exported_at: new Date().toISOString(),
  };
}
