"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

type OptionalWord = { word: string; gloss: string };

function readOptionalWords(config: Record<string, unknown>): OptionalWord[] {
  if (!Array.isArray(config.optionalWords)) return [];
  return config.optionalWords.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const word = "word" in entry && typeof entry.word === "string" ? entry.word : "";
    const gloss = "gloss" in entry && typeof entry.gloss === "string" ? entry.gloss : "";
    return word ? [{ word, gloss }] : [];
  });
}

type TimedWriteStepProps = {
  config: Record<string, unknown>;
  submitDraft: StepRenderProps["submitDraft"];
  onTextChange: StepRenderProps["onTextChange"];
};

export function TimedWriteStep({
  config,
  submitDraft,
  onTextChange,
}: TimedWriteStepProps) {
  const t = useTranslations("exerciseRunner");
  const promptKey =
    typeof config.promptKey === "string" ? config.promptKey : undefined;
  const prompt =
    promptKey
      ? t(promptKey as "freeProductionPromptRecent")
      : typeof config.prompt === "string"
        ? config.prompt
        : "";
  const durationSec = typeof config.durationSec === "number" ? config.durationSec : 0;
  const optionalWords = readOptionalWords(config);

  return (
    <div className="space-y-4">
      {prompt ? (
        <p className="text-xl font-medium leading-snug text-ink">{prompt}</p>
      ) : null}
      {durationSec > 0 ? (
        <p className="text-sm text-muted">
          {t("timedWriteDuration", { minutes: Math.round(durationSec / 60) })}
        </p>
      ) : null}
      {optionalWords.length > 0 ? (
        <p className="text-sm text-muted">
          {t("timedWriteOptionalWords", {
            words: optionalWords.map((entry) => entry.word).join(", "),
          })}
        </p>
      ) : null}
      <Field label={t("timedWriteFieldLabel")}>
        <Textarea
          value={submitDraft.text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={t("timedWritePlaceholder")}
          rows={8}
          aria-label={t("timedWriteFieldLabel")}
        />
      </Field>
      <p className="text-sm text-muted">{t("timedWriteHint")}</p>
    </div>
  );
}
