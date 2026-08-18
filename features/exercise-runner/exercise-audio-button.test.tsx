import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseAudioButton } from "./ExerciseAudioButton";

describe("ExerciseAudioButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("speaks text sources with the learning-language locale", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    class MockUtterance {
      text = "";
      lang = "";
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel },
    });

    const user = userEvent.setup();
    render(
      <ExerciseAudioButton
        config={{ speechText: "El café está en la mesa.", languageCode: "es" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /play audio/i }));

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "El café está en la mesa.",
        lang: "es-ES",
      }),
    );
  });

  it("plays hosted audio clips inline", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({ play })),
    );

    const user = userEvent.setup();
    render(
      <ExerciseAudioButton config={{ audioUrl: "https://example.com/clip.mp3" }} />,
    );

    await user.click(screen.getByRole("button", { name: /play audio/i }));

    expect(play).toHaveBeenCalled();
  });
});
