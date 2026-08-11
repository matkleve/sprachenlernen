import type { Metadata } from "next";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { copy as shellCopy } from "@/features/app-shell/content";
import { copy } from "@/features/progress/content";
import { ProgressReport } from "@/features/progress/ProgressReport";
import { readProgress } from "@/features/progress/reading";
import { toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: shellCopy.destinations.progress,
};

/**
 * The Progress destination (T-B3). Contract: docs/specs/page/progress.md
 *
 * A page composes and passes data down — the derivation is in
 * lib/level-model.ts and the loading in features/progress/reading.ts, so both
 * are reachable by a test without a router (docs/ARCHITECTURE.md).
 */
export default async function ProgressPage() {
  const outcome = await readProgress();

  if (outcome.status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
        <ErrorCallout className="mt-page-content" {...toUserFacing(outcome.error)} />
      </div>
    );
  }

  return <ProgressReport reading={outcome.reading} />;
}
