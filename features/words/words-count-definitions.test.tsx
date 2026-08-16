import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { copy } from "./content";
import { WordsCountDefinitions } from "./WordsCountDefinitions";

describe("WordsCountDefinitions", () => {
  it("collapses count definitions by default", () => {
    render(<WordsCountDefinitions />);
    expect(screen.getByText(copy.countsDefinitionsSummary)).toBeDefined();
    const details = screen.getByText(copy.countsDefinitionsSummary).closest("details");
    expect(details?.hasAttribute("open")).toBe(false);
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(<WordsCountDefinitions />);
    await expectNoA11yViolations(container);
  });
});
