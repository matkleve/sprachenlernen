"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import {
  hasExerciseStepAudio,
  parseExerciseStepAudioConfig,
} from "@/lib/exercise-step-audio";
import { speechSynthesisLocale } from "@/lib/speech-synthesis-locale";

type ExerciseAudioButtonProps = {
  config: Record<string, unknown>;
  disabled?: boolean;
};

function speakText(text: string, languageCode: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechSynthesisLocale(languageCode);
  window.speechSynthesis.speak(utterance);
}

async function playClip(url: string): Promise<void> {
  const clip = new Audio(url);
  await clip.play();
}

export function ExerciseAudioButton({ config, disabled = false }: ExerciseAudioButtonProps) {
  const t = useTranslations("exerciseRunner");
  const audio = parseExerciseStepAudioConfig(config);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(async () => {
    if (disabled || !hasExerciseStepAudio(audio)) return;

    if (audio.audioUrl) {
      try {
        setPlaying(true);
        await playClip(audio.audioUrl);
      } finally {
        setPlaying(false);
      }
      return;
    }

    if (audio.speechText && audio.languageCode) {
      speakText(audio.speechText, audio.languageCode);
    }
  }, [audio, disabled]);

  if (disabled || !hasExerciseStepAudio(audio)) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      pending={playing}
      pendingPolicy="none"
      onClick={() => {
        void play();
      }}
    >
      {t("playAudio")}
    </Button>
  );
}
