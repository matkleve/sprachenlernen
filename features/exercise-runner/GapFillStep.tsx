"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseGapFillConfig } from "@/lib/gap-selection";
import { cn } from "@/lib/utils";

type GapFillStepProps = {
  config: Record<string, unknown>;
  listeningDeferred?: boolean;
};

export function GapFillStep({ config, listeningDeferred = false }: GapFillStepProps) {
  const t = useTranslations("exerciseRunner");
  const line = parseGapFillConfig(config);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!line) {
    return null;
  }

  const audioUrl = typeof config.audioUrl === "string" ? config.audioUrl : undefined;
  const showAudio = !listeningDeferred && Boolean(audioUrl);

  const setAnswer = (index: number, value: string) => {
    setAnswers((current) => ({ ...current, [index]: value }));
  };

  return (
    <div className="space-y-4">
      {listeningDeferred ? (
        <p className="text-sm text-muted">{t("typeOnlyHint")}</p>
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

      <p className="text-lg leading-relaxed text-ink" aria-label={line.sentence}>
        {line.tokens.map((token, index) => (
          <span key={`${token.text}-${index}`} className="mr-1 inline-flex items-center">
            {token.gapped ? (
              <Input
                value={answers[index] ?? ""}
                onChange={(event) => setAnswer(index, event.target.value)}
                aria-label={t("gapInputLabel", { word: index + 1 })}
                placeholder={t("gapPlaceholder")}
                className={cn("inline-block h-9 w-24 px-2 text-base")}
              />
            ) : (
              <span>{token.text}</span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}
