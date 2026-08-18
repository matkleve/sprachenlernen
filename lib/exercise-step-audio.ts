/**
 * Audio config for dictation-family exercise steps.
 * Contract: docs/specs/service/exercise-step-components.md
 */
import type { Source } from "@/lib/coverage";

export type ExerciseStepAudioConfig = {
  audioUrl?: string;
  speechText?: string;
  languageCode?: string;
};

export function dictationAudioConfig(
  source: Source,
  sentence: string,
): ExerciseStepAudioConfig {
  if (source.kind === "audio" && source.sourceUrl) {
    return { audioUrl: source.sourceUrl };
  }
  const trimmed = sentence.trim();
  if (source.kind === "text" && trimmed) {
    return { speechText: trimmed, languageCode: source.languageCode };
  }
  return {};
}

export function parseExerciseStepAudioConfig(
  config: Record<string, unknown>,
): ExerciseStepAudioConfig {
  const audioUrl = typeof config.audioUrl === "string" ? config.audioUrl : undefined;
  const speechText = typeof config.speechText === "string" ? config.speechText : undefined;
  const languageCode =
    typeof config.languageCode === "string" ? config.languageCode : undefined;
  return { audioUrl, speechText, languageCode };
}

export function hasExerciseStepAudio(
  audio: ExerciseStepAudioConfig,
): audio is ExerciseStepAudioConfig & ({ audioUrl: string } | { speechText: string }) {
  return Boolean(audio.audioUrl?.trim() || audio.speechText?.trim());
}
