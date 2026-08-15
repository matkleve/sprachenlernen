import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { BisectBanner } from "@/features/safari-bisect/BisectBanner";
import { WordsBisect } from "@/features/safari-bisect/WordsBisect";
import { readWordsHome } from "@/features/words/reading";
import { routes } from "@/lib/routes";
import {
  WORDS_BISECT_MAX_LEVEL,
  parseBisectLevel,
  wordsBisectLevelLabels,
} from "@/lib/safari-bisect";
import { toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Words bisect",
  robots: { index: false, follow: false },
};

/**
 * Progressive Words body for iOS PWA bisect. Contract: docs/study/31-ios-safari-pwa-test-report.md
 */
export default async function WordsBisectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const level = parseBisectLevel(params.level, WORDS_BISECT_MAX_LEVEL);
  const outcome = await readWordsHome();

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
        basePath="/words-bisect"
        level={level}
        maxLevel={WORDS_BISECT_MAX_LEVEL}
        levelLabels={wordsBisectLevelLabels}
      />
      <WordsBisect
        level={level}
        snapshot={outcome.snapshot}
        blocks={outcome.blocks}
        languageCode={outcome.languageCode}
        translations={outcome.translations}
        horizonDisplay={outcome.horizonDisplay}
        now={outcome.now}
      />
    </>
  );
}
