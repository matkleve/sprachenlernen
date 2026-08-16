import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { readWordsHome } from "@/features/words/reading";
import { WordsHome } from "@/features/words/WordsHome";
import { toUserFacing } from "@/lib/errors";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("appShell");
  return { title: t("holding.words.title") };
}

/**
 * Words destination — vocabulary home and one-tap review entry (UC-063).
 * Contract: docs/specs/page/words.md, docs/specs/feature/words-home.md
 */
export default async function WordsPage() {
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
    <WordsHome
      snapshot={outcome.snapshot}
      blocks={outcome.blocks}
      languageCode={outcome.languageCode}
      translations={outcome.translations}
      horizonDisplay={outcome.horizonDisplay}
      now={outcome.now}
    />
  );
}
