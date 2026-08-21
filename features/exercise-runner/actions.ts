"use server";

import { activeLanguageOf, listLearningLanguages } from "@/lib/db/learning-languages";
import { checkSentence, type SentenceCheckResult } from "@/lib/sentence-check";
import { loadLemmaTableForLanguage } from "@/lib/shipped-language";

/**
 * Server Action for the `sentence-check` step. Contracts:
 * - docs/specs/service/sentence-check.md
 * - docs/specs/feature/exercise-runner.md
 *
 * The rules are pure and live in `lib/sentence-check`; this is only the seam
 * that gets the 2.8 MB lemma table to them. The table is why the check runs
 * here at all — it cannot ride along in the client bundle — so moving the check
 * to the device later is a change to this file and nothing else.
 *
 * Every failure comes back as `unavailable`. A checker that quietly reports "no
 * findings" when it could not run would tell the learner their sentence is fine
 * on the strength of never having looked at it.
 */
export async function checkSentenceAction(input: {
  text: string;
  targetLemma?: string;
  targetWord?: string;
}): Promise<SentenceCheckResult> {
  try {
    const learning = await listLearningLanguages();
    if (learning.status === "error") return { status: "unavailable", reason: "failed" };

    const languageCode = activeLanguageOf(learning.languages);
    if (!languageCode) return { status: "unavailable", reason: "no-lexicon" };

    return checkSentence(input, loadLemmaTableForLanguage(languageCode) ?? undefined, languageCode);
  } catch {
    return { status: "unavailable", reason: "failed" };
  }
}
