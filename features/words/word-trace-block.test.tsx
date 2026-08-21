import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WordTraceBlock } from "@/features/words/WordTraceBlock";
import { routes } from "@/lib/routes";

describe("WordTraceBlock", () => {
  it("lists linked source titles for appearances", () => {
    render(
      <WordTraceBlock
        trace={{
          kind: "appearances",
          appearanceCount: 2,
          topSources: [
            { id: "es-fixture-cafe", title: "En el café" },
            { id: "wikinews-es-3516", title: "Autoridades electorales mantienen prohibición de presencia de observadores en elecciones egipcias" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Appears in 2 sources — see what it unlocks")).toBeDefined();
    expect(screen.getByText("In 2 saved texts or episodes")).toBeDefined();
    const cafeLink = screen.getByRole("link", { name: "En el café" });
    expect(cafeLink.getAttribute("href")).toBe(routes.contentDetail("es-fixture-cafe"));
  });

  it("shows the empty state with a library link", () => {
    render(<WordTraceBlock trace={{ kind: "empty" }} />);

    expect(screen.getByText(en.contentTrace.word.empty)).toBeDefined();
    const libraryLink = screen.getByRole("link", { name: en.contentTrace.word.emptyLink });
    expect(libraryLink.getAttribute("href")).toBe(routes.content);
  });
});
