import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

import { ErrorCallout } from "@/components/ui/ErrorCallout";
import { holding } from "@/features/app-shell/content";
import { readWordsHome } from "@/features/words/reading";
import { WordsHome } from "@/features/words/WordsHome";
import { toUserFacing } from "@/lib/errors";

export const metadata: Metadata = {
  title: holding.words.title,
};

/**
 * Words destination — vocabulary home and one-tap review entry (UC-063).
 * Contract: docs/specs/page/words.md, docs/specs/feature/words-home.md
 */
export default async function WordsPage() {
  const outcome = await readWordsHome();

  // Nothing chosen yet is not an error and not an empty page — it is a
  // question the learner has not been asked.
  if (outcome.status === "no-language") redirect(routes.chooseLanguage);

  if (outcome.status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{holding.words.title}</h1>
        <ErrorCallout className="mt-page-content" {...toUserFacing(outcome.error)} />
      </div>
    );
  }

  return <WordsHome snapshot={outcome.snapshot} />;
}
