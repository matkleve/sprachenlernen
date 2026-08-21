import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { BisectBanner } from "@/features/safari-bisect/BisectBanner";
import { ProgressBisect } from "@/features/safari-bisect/ProgressBisect";
import { readProgress } from "@/features/progress/reading";
import { readWeeklyReflection } from "@/features/progress/weekly-reflection/reading";
import { routes } from "@/lib/routes";
import {
  PROGRESS_BISECT_MAX_LEVEL,
  parseBisectLevel,
  progressBisectLevelLabels,
} from "@/lib/safari-bisect";
import { toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Progress bisect",
  robots: { index: false, follow: false },
};

/**
 * Progressive Progress body for iOS PWA bisect. Contract: docs/qa/QA-031-ios-safari-pwa-test-report.md
 */
export default async function ProgressBisectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const level = parseBisectLevel(params.level, PROGRESS_BISECT_MAX_LEVEL);
  const [outcome, reflection] = await Promise.all([readProgress(), readWeeklyReflection()]);

  if (outcome.status === "no-language") redirect(routes.chooseLanguage);

  if (outcome.status === "error") {
    return (
      <ShellPageContent width="narrow">
        <ErrorCallout {...toUserFacing(outcome.error)} />
      </ShellPageContent>
    );
  }

  return (
    <>
      <BisectBanner
        basePath="/progress-bisect"
        level={level}
        maxLevel={PROGRESS_BISECT_MAX_LEVEL}
        levelLabels={progressBisectLevelLabels}
      />
      <ProgressBisect level={level} reading={outcome.reading} reflection={reflection} />
    </>
  );
}
