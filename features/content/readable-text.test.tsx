import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReadableText } from "./ReadableText";
import { renderWithIntl, renderWithIntlDe, screen } from "@/tests/i18n-test-utils";

const segments = [
  { kind: "text" as const, value: "Un " },
  { kind: "word" as const, text: "café", gloss: "coffee" },
  { kind: "text" as const, value: "." },
];

describe("ReadableText", () => {
  it("opens a gloss dialog when a word is tapped", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReadableText segments={segments} />);

    await user.click(screen.getByRole("button", { name: "café" }));

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("coffee")).toBeDefined();
  });

  it("closes the gloss dialog", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ReadableText segments={segments} />);

    await user.click(screen.getByRole("button", { name: "café" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders German dialog chrome when locale is de", async () => {
    const user = userEvent.setup();
    renderWithIntlDe(<ReadableText segments={[{ kind: "word", text: "café", gloss: null }]} />);

    await user.click(screen.getByRole("button", { name: "café" }));

    expect(screen.getByRole("button", { name: "Schließen" })).toBeDefined();
    expect(screen.getByText("Noch nicht in Ihrem Starter-Pool.")).toBeDefined();
  });
});
