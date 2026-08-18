import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { SkillTierBadge, SkillTierBadgeRow, SkillTierOverflow } from "./SkillTierBadge";

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

  it("sizes card badges to shield silhouette width, not a fixed square box", () => {
    const { container } = render(
      <SkillTierBadge skill="listening" tier="wood" size="card" />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("h-16");
    expect(wrapper?.className).toContain("md:h-20");
    expect(wrapper?.className).not.toContain("w-16");
    expect(wrapper?.className).not.toContain("max-w-");
  });

  it("keeps ornate tiers at the same rendered height as wood", () => {
    const { container: wood } = render(
      <SkillTierBadge skill="listening" tier="wood" size="card" />,
    );
    const { container: gold } = render(
      <SkillTierBadge skill="listening" tier="gold" size="card" />,
    );

    const woodImage = wood.querySelector("img");
    const goldImage = gold.querySelector("img");
    expect(woodImage?.className).toContain("h-16");
    expect(goldImage?.className).toContain("h-16");
    expect(goldImage?.className).not.toContain("w-full");
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

describe("SkillTierBadgeRow", () => {
  it("overlaps card shields to collapse PNG transparent margins", () => {
    const { container } = render(
      <SkillTierBadgeRow
        size="card"
        visible={[
          { skill: "listening", tier: "wood" },
          { skill: "reading", tier: "gold" },
        ]}
        overflow={[]}
      />,
    );
    expect(container.firstElementChild?.className).toContain("-space-x-4");
    expect(container.firstElementChild?.className).toContain("gap-0");
  });
});
