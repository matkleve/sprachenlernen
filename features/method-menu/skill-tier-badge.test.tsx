import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { SkillTierBadge } from "./SkillTierBadge";

describe("SkillTierBadge", () => {
  it("renders the tier asset with an accessible name and no visible label", () => {
    render(<SkillTierBadge skill="listening" tier="gold" />);

    const badge = screen.getByRole("img", {
      name: `Gold ${en.methodMenu.skillLabels.listening} contribution`,
    });
    expect(badge.getAttribute("src")).toContain("listening-gold.svg");
    expect(screen.queryByText(/Gold/i)).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SkillTierBadge skill="reading" tier="silver" />);
    await expectNoA11yViolations(container);
  });
});
