import { describe, expect, it } from "vitest";

import { dictationAudioConfig } from "@/lib/exercise-step-audio";
import type { Source } from "@/lib/coverage";

const textSource: Source = {
  id: "es-fixture-cafe",
  languageCode: "es",
  kind: "text",
  title: "Café",
  origin: "fixture",
  body: "El café está en la mesa.",
  addedAt: "2026-01-01T00:00:00.000Z",
};

const audioSource: Source = {
  id: "es-audio-1",
  languageCode: "es",
  kind: "audio",
  title: "Episode",
  origin: "catalogue",
  transcript: "Hola.",
  sourceUrl: "https://example.com/clip.mp3",
  addedAt: "2026-01-01T00:00:00.000Z",
};

describe("dictationAudioConfig", () => {
  it("uses browser speech for text sources", () => {
    expect(dictationAudioConfig(textSource, "El café está en la mesa.")).toEqual({
      speechText: "El café está en la mesa.",
      languageCode: "es",
    });
  });

  it("uses clip url for audio sources", () => {
    expect(dictationAudioConfig(audioSource, "Hola.")).toEqual({
      audioUrl: "https://example.com/clip.mp3",
    });
  });
});
