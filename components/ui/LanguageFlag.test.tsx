import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageFlag } from "@/components/ui/LanguageFlag";

/** Contract: docs/specs/component/language-flag.md */

describe("LanguageFlag", () => {
  it("renders the decorative flag glyph in a circle", () => {
    render(<LanguageFlag code="es" data-testid="flag" />);

    const flag = screen.getByTestId("flag");
    expect(flag.textContent).toContain("🇪🇸");
    expect(flag.className).toContain("size-11");
  });
});
