import { renderWithIntl, screen, en } from "@/tests/i18n-test-utils";
import { describe, expect, it } from "vitest";

import { WordTraceBlock } from "@/features/words/WordTraceBlock";

describe("WordTraceBlock", () => {
  it("shows empty-state copy and library link when the lemma has no sources", () => {
    renderWithIntl(<WordTraceBlock trace={{ kind: "empty" }} />);

    expect(screen.getByText(en.contentTrace.word.empty)).toBeDefined();
    expect(screen.getByRole("link", { name: en.contentTrace.word.emptyLink })).toBeDefined();
    expect(screen.queryByRole("link", { name: "En el café" })).toBeNull();
  });

  it("shows UC-021 loop line and linked source titles", () => {
    renderWithIntl(
      <WordTraceBlock
        trace={{
          kind: "appearances",
          appearanceCount: 2,
          topSources: [
            { id: "es-fixture-cafe", title: "En el café" },
            { id: "wikinews-es-3516", title: "Wikinews headline" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Appears in 2 sources — see what it unlocks")).toBeDefined();
    expect(screen.getByRole("link", { name: "En el café" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Wikinews headline" })).toBeDefined();
  });
});
