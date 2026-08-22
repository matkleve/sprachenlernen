import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReadableText } from "./ReadableText";
import { renderWithIntl, renderWithIntlDe, screen, de } from "@/tests/i18n-test-utils";

const sentences = [
  {
    segments: [
      { kind: "text" as const, value: "Un " },
      { kind: "word" as const, text: "café", gloss: "coffee" },
      { kind: "text" as const, value: "." },
    ],
  },
];

describe("ReadableText", () => {
  it("opens a gloss dialog when a word is tapped", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReadableText sentences={sentences} />);

    await user.click(screen.getByRole("button", { name: "café" }));

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("coffee")).toBeDefined();
  });

  it("closes the gloss dialog", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReadableText sentences={sentences} />);

    await user.click(screen.getByRole("button", { name: "café" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("reveals sentence gloss hints on second tap", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReadableText sentences={sentences} />);

    await user.click(screen.getByText("."));
    expect(screen.getByText("Tap again to see word glosses for this sentence.")).toBeDefined();

    await user.click(screen.getByText("."));
    expect(screen.getByText("coffee")).toBeDefined();
    expect(screen.getByText("Word glosses — not a full sentence translation.")).toBeDefined();
  });

  it("renders German dialog chrome when locale is de", async () => {
    const user = userEvent.setup();
    renderWithIntlDe(
      <ReadableText
        sentences={[{ segments: [{ kind: "word", text: "café", gloss: null }] }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "café" }));

    expect(screen.getByRole("button", { name: de.contentTrace.reading.close })).toBeDefined();
    expect(screen.getByText(de.contentTrace.reading.noGloss)).toBeDefined();
  });
});
