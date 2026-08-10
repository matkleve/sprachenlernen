import type { Account } from "@/lib/db/auth";
import type { ReviewLogRow } from "@/lib/db/review-log";

import type { ExportScope } from "./content";

export type ExportPayload =
  | { review_log: ReviewLogRow[] }
  | { account: Pick<Account, "email">; review_log: ReviewLogRow[]; exported_at: string };

export function buildExportPayload(
  scope: ExportScope,
  account: Account,
  reviews: ReviewLogRow[],
): ExportPayload {
  if (scope === "reviews") {
    return { review_log: reviews };
  }

  return {
    account: { email: account.email },
    review_log: reviews,
    exported_at: new Date().toISOString(),
  };
}
