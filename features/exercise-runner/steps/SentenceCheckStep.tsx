"use client";

import { useRef, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { checkSentenceAction } from "@/features/exercise-runner/actions";
import { SentenceCheckNotes } from "@/features/exercise-runner/steps/SentenceCheckNotes";
import { SentenceLines } from "@/features/exercise-runner/steps/SentenceLines";
import { practiceLeadClass } from "@/features/exercise-runner/practice-surface/PracticeSurface";
import type { StepAnswer, StepCheckState } from "@/lib/exercise-runner/types";
import type { SentenceCheckConfig } from "@/lib/exercise-step-components";
import { flaggedTokenIndices } from "@/lib/sentence-check";

type SentenceCheckStepProps = {
  config: SentenceCheckConfig;
  answer: StepAnswer;
  onTextChange: (text: string) => void;
  onCheckChange: (check: StepCheckState) => void;
};

/**
 * Write one sentence with a target word, check it, correct it. Contract:
 * docs/specs/service/sentence-check.md
 *
 * Replaces the two-screen `type-with-word` → `reveal-answer` pair. Showing a
 * model sentence to compare against is a recast, and recasts often are not
 * noticed as corrections at all; marking the word and letting the learner fix
 * it is a prompt, which Lyster & Ranta find more effective
 * (docs/study/STUDY-006-production.md).
 */
export function SentenceCheckStep({
  config,
  answer,
  onTextChange,
  onCheckChange,
}: SentenceCheckStepProps) {
  const t = useTranslations("exerciseRunner");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();

  const result = answer.check.phase === "checked" ? answer.check.result : null;
  const busy = pending || answer.check.phase === "checking";
  const checkedTokens =
    result?.status === "checked" && result.tokens.length > 0
      ? { tokens: result.tokens, flagged: flaggedTokenIndices(result) }
      : null;

  function check() {
    if (!answer.text.trim()) return;

    // Collapse the keyboard first: the findings appear under the lines, and on
    // a phone the keyboard is covering exactly that.
    textareaRef.current?.blur();
    onCheckChange({ phase: "checking" });

    startTransition(async () => {
      const checked = await checkSentenceAction({
        text: answer.text.trim(),
        targetLemma: config.lemma,
        targetWord: config.word,
      });
      onCheckChange({ phase: "checked", result: checked });
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 max-md:gap-3">
      <div className="space-y-1">
        <p className={practiceLeadClass}>{t("sentenceCheckPrompt")}</p>
        {config.itemCount && config.itemCount > 1 ? (
          <p className="text-sm text-muted max-md:text-xs">
            {t("sentenceCheckProgress", {
              index: config.itemIndex ?? 1,
              total: config.itemCount,
            })}
          </p>
        ) : null}
      </div>

      <div className="text-center">
        <p className="text-3xl font-semibold text-ink max-md:text-2xl">{config.word}</p>
        {config.gloss ? (
          <p className="mt-1 text-base text-muted max-md:text-sm">{config.gloss}</p>
        ) : null}
      </div>

      <SentenceLines
        ref={textareaRef}
        value={answer.text}
        onChange={onTextChange}
        checked={checkedTokens}
      />

      <SentenceCheckNotes result={result} busy={busy} />

      {result ? null : (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={check}
            disabled={busy || answer.text.trim().length === 0}
          >
            {busy ? t("sentenceCheckChecking") : t("sentenceCheckAction")}
          </Button>
        </div>
      )}
    </div>
  );
}
