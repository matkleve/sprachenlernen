/** Contract: docs/specs/service/sentence-check.md */
import type { LemmaTable } from "@/lib/lemma-table";

import { languageRules } from "./languages";
import {
  agreementFindings,
  missingTargetFinding,
  personFindings,
  spellingFindings,
} from "./rules";
import { tokeniseSentence } from "./tokens";
import type { SentenceCheckInput, SentenceCheckResult, SentenceFinding } from "./types";

/**
 * Check one sentence against a lemma table. Pure: the caller loads the table
 * (2.8 MB — server side) and owns every failure mode around it.
 *
 * There is no `correct` outcome by design. An empty `findings` list means "none
 * of the four rules fired", which is what the learner is told. Word order, word
 * choice and idiom are not examined and the copy must never imply they were.
 */
export function checkSentence(
  input: SentenceCheckInput,
  table: LemmaTable | undefined,
  languageCode: string,
): SentenceCheckResult {
  const rules = languageRules(languageCode);
  if (!table || !rules) return { status: "unavailable", reason: "no-lexicon" };

  const tokens = tokeniseSentence(input.text, table);
  if (tokens.length === 0) {
    return { status: "checked", text: input.text, tokens: [], findings: [] };
  }

  const findings: SentenceFinding[] = [
    ...spellingFindings(tokens, table),
    ...agreementFindings(tokens, table, rules),
    ...personFindings(tokens, table, rules),
  ];

  const missing = missingTargetFinding(tokens, input.targetLemma, input.targetWord);
  if (missing) findings.push(missing);

  return {
    status: "checked",
    text: input.text,
    tokens: tokens.map(({ text, start, end }) => ({ text, start, end })),
    // Sentence order, so the notes under the lines read left to right; the
    // whole-sentence finding (index -1) sorts to the end, not the front.
    findings: findings.sort((a, b) => {
      if (a.tokenIndex === -1) return 1;
      if (b.tokenIndex === -1) return -1;
      return a.tokenIndex - b.tokenIndex;
    }),
  };
}

/** Token verdicts derived from findings — the UI never recomputes this. */
export function flaggedTokenIndices(result: SentenceCheckResult): Set<number> {
  if (result.status !== "checked") return new Set();
  return new Set(
    result.findings.map((finding) => finding.tokenIndex).filter((index) => index >= 0),
  );
}
