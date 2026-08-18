"use client";

import { useTranslations } from "next-intl";

import { ExerciseAudioButton } from "@/features/exercise-runner/ExerciseAudioButton";

type AudioPlayStepProps = {
  config: Record<string, unknown>;
  listeningDeferred?: boolean;
};

export function AudioPlayStep({
  config,
  listeningDeferred = false,
}: AudioPlayStepProps) {
  const t = useTranslations("exerciseRunner");
  const body = typeof config.body === "string" ? config.body : "";
  const transcript = typeof config.transcript === "string" ? config.transcript : "";

  return (
    <div className="space-y-4">
      {listeningDeferred ? (
        <p className="text-sm text-muted">{t("typeOnlyHint")}</p>
      ) : (
        <ExerciseAudioButton config={config} disabled={listeningDeferred} />
      )}
      {body ? <p className="text-base text-ink">{body}</p> : null}
      {transcript ? (
        <p className="text-sm text-muted" aria-label={t("audioTranscriptLabel")}>
          {transcript}
        </p>
      ) : null}
    </div>
  );
}
