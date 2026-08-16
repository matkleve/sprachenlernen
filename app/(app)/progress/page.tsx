import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { ProgressReport } from "@/features/progress/ProgressReport";
import { readProgress } from "@/features/progress/reading";
import { readWeeklyReflection } from "@/features/progress/weekly-reflection/reading";
import { toUserFacing } from "@/lib/errors";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("appShell");
  return { title: t("destinations.progress") };
}

/**
 * The Progress destination (T-B3). Contract: docs/specs/page/progress.md
 */
export default async function ProgressPage() {
  const [outcome, reflection] = await Promise.all([readProgress(), readWeeklyReflection()]);

  if (outcome.status === "no-language") redirect(routes.chooseLanguage);

  if (outcome.status === "error") {
    return (
      <ShellPageContent width="narrow">
        <ErrorCallout {...toUserFacing(outcome.error)} />
      </ShellPageContent>
    );
  }

  return <ProgressReport reading={outcome.reading} reflection={reflection} />;
}
