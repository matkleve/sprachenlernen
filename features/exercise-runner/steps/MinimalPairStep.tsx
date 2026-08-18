"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { speechSynthesisLocale } from "@/lib/speech-synthesis-locale";

type MinimalPairStepProps = {
  config: Record<string, unknown>;
  listeningDeferred?: boolean;
};

function speakWord(text: string, languageCode: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechSynthesisLocale(languageCode);
  window.speechSynthesis.speak(utterance);
}

export function MinimalPairStep({
  config,
  listeningDeferred = false,
}: MinimalPairStepProps) {
  const t = useTranslations("exerciseRunner");
  const prompt = typeof config.prompt === "string" ? config.prompt : t("minimalPairDefault");
  const optionA = typeof config.optionA === "string" ? config.optionA : "A";
  const optionB = typeof config.optionB === "string" ? config.optionB : "B";
  const languageCode = typeof config.languageCode === "string" ? config.languageCode : "es";
  const playedId = config.playedId === "b" ? "b" : "a";
  const playedText = playedId === "a" ? optionA : optionB;
  const [selected, setSelected] = useState<string | null>(null);

  const playSample = useCallback(() => {
    if (listeningDeferred) return;
    speakWord(playedText, languageCode);
  }, [listeningDeferred, playedText, languageCode]);

  return (
    <div className="space-y-4">
      <p className="text-lg text-ink">{prompt}</p>
      {listeningDeferred ? (
        <p className="text-sm text-muted">{t("typeOnlyHint")}</p>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={playSample}>
          {t("minimalPairPlay")}
        </Button>
      )}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant={selected === "a" ? "primary" : "secondary"}
          className={cn("justify-start")}
          onClick={() => setSelected("a")}
        >
          {optionA}
        </Button>
        <Button
          type="button"
          variant={selected === "b" ? "primary" : "secondary"}
          className={cn("justify-start")}
          onClick={() => setSelected("b")}
        >
          {optionB}
        </Button>
      </div>
      {selected ? (
        <p className="text-sm text-muted">{t("minimalPairSelfCheck")}</p>
      ) : null}
    </div>
  );
}
