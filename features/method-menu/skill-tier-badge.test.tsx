import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { SkillTierBadge, SkillTierOverflow } from "./SkillTierBadge";

describe("SkillTierBadge", () => {
  it("renders the tier asset with an accessible name and no visible label", () => {
    render(<SkillTierBadge skill="listening" tier="gold" />);

    const badge = screen.getByRole("img", { name: "Gold Listening" });
    expect(badge.getAttribute("src")).toContain("listening-gold.png");
    expect(screen.queryByText(/^Gold$/)).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SkillTierBadge skill="reading" tier="silver" />);
    await expectNoA11yViolations(container);
  });
});

describe("SkillTierOverflow", () => {
  it("names hidden shields in aria-label", () => {
    render(
      <SkillTierOverflow
        overflow={[
          { skill: "writing", tier: "bronze" },
          { skill: "speaking", tier: "silver" },
        ]}
      />,
    );
    expect(screen.getByLabelText(/2 more: Bronze Writing, Silver Speaking/i)).toBeDefined();
  });
});
