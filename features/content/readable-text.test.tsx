import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { copy } from "./content";
import { ReadableText } from "./ReadableText";

const segments = [
  { kind: "text" as const, value: "Un " },
  { kind: "word" as const, text: "café", gloss: "coffee" },
  { kind: "text" as const, value: "." },
];

describe("ReadableText", () => {
  it("opens a gloss dialog when a word is tapped", async () => {
    const user = userEvent.setup();
    render(<ReadableText segments={segments} />);

    await user.click(screen.getByRole("button", { name: "café" }));

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("coffee")).toBeDefined();
  });

  it("closes the gloss dialog", async () => {
    const user = userEvent.setup();
    render(<ReadableText segments={segments} />);

    await user.click(screen.getByRole("button", { name: "café" }));
    await user.click(screen.getByRole("button", { name: copy.readingClose }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
