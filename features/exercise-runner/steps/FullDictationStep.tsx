"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

type FullDictationStepProps = {
  config: Record<string, unknown>;
  listeningDeferred?: boolean;
};

export function FullDictationStep({ config, listeningDeferred = false }: FullDictationStepProps) {
  const t = useTranslations("exerciseRunner");
  const audioUrl = typeof config.audioUrl === "string" ? config.audioUrl : undefined;
  const itemIndex = typeof config.itemIndex === "number" ? config.itemIndex : null;
  const itemCount = typeof config.itemCount === "number" ? config.itemCount : null;
  const readsPerSentence =
    typeof config.readsPerSentence === "number" ? config.readsPerSentence : 3;
  const showAudio = !listeningDeferred && Boolean(audioUrl);

  return (
    <div className="space-y-4">
      {itemIndex !== null && itemCount !== null && itemCount > 1 ? (
        <p className="text-sm font-medium text-muted">
          {t("fullDictationProgress", { current: itemIndex, total: itemCount })}
        </p>
      ) : null}

      {listeningDeferred ? (
        <p className="text-sm text-muted">{t("fullDictationDeferred")}</p>
      ) : null}

      {showAudio ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (audioUrl) window.open(audioUrl, "_blank", "noopener,noreferrer");
          }}
        >
          {t("playAudio")}
        </Button>
      ) : null}

      <p className="text-base leading-relaxed text-ink">
        {t("fullDictationProtocol", { reads: readsPerSentence })}
      </p>
      <p className="text-sm text-muted">{t("fullDictationWriteOnPaper")}</p>
    </div>
  );
}
