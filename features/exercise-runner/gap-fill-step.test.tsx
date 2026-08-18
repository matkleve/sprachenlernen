import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GapFillStep } from "./GapFillStep";

const gapConfig = {
  sentence: "El café está en la mesa.",
  tokens: [
    { text: "El", gapped: false },
    { text: "café", gapped: true },
    { text: "está", gapped: false },
    { text: "en", gapped: false },
    { text: "la", gapped: false },
    { text: "mesa.", gapped: true },
  ],
  audioUrl: "https://example.com/audio.mp3",
};

describe("GapFillStep", () => {
  it("renders inline inputs for gapped tokens", () => {
    render(<GapFillStep config={gapConfig} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByText("El")).toBeDefined();
    expect(screen.getByText("está")).toBeDefined();
  });

  it("AC-3 / AC-4: hides audio and shows type-only hint when listening deferred", () => {
    render(<GapFillStep config={gapConfig} listeningDeferred />);
    expect(screen.queryByRole("button", { name: /play audio/i })).toBeNull();
    expect(screen.getByText(/listening is paused/i)).toBeDefined();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("shows play audio when not deferred and audioUrl is set", () => {
    render(<GapFillStep config={gapConfig} />);
    expect(screen.getByRole("button", { name: /play audio/i })).toBeDefined();
  });
});
