/**
 * BCP-47 tags for Web Speech API playback in exercise steps.
 * Contract: docs/specs/service/exercise-step-components.md
 */

const SPEECH_LOCALE: Record<string, string> = {
  es: "es-ES",
  it: "it-IT",
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
};

export function speechSynthesisLocale(languageCode: string): string {
  return SPEECH_LOCALE[languageCode] ?? languageCode;
}
