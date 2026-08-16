import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { loadMethodCatalogue } from "./catalogue";
import { MethodDetail, findMethod } from "./MethodDetail";
import { copy, effortCard } from "./content";
import { skillTierAriaLabel } from "./skill-tier-badges";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const { catalogue } = loadMethodCatalogue();
const extensiveReading = findMethod(catalogue, "extensive-reading")!;
const intensiveReading = findMethod(catalogue, "intensive-reading")!;
const narrowListening = findMethod(catalogue, "narrow-listening")!;
const srsSession = findMethod(catalogue, "srs-session")!;

describe("MethodDetail", () => {
  it("shows plain effort in the badge band without a dot scale", () => {
    render(<MethodDetail method={intensiveReading} />);

    expect(screen.getByText(effortCard[3])).toBeDefined();
    expect(screen.queryByText(/3 of 3/)).toBeNull();
  });

  it("shows effort anchor sentence in practical details", () => {
    render(<MethodDetail method={intensiveReading} />);

    expect(document.body.textContent).toContain("you will be tired afterwards");
  });

  it("shows a single duration chip in the facts panel", () => {
    render(<MethodDetail method={narrowListening} />);
    expect(screen.getAllByText("10–45 min").length).toBeGreaterThan(0);
  });

  it("shows skill tier badges for improving skills", () => {
    render(<MethodDetail method={narrowListening} />);

    expect(
      screen.getByRole("img", {
        name: skillTierAriaLabel("listening", "gold"),
      }),
    ).toBeDefined();
  });

  it("shows article prose for a shipped method", () => {
    render(
      <MethodDetail method={extensiveReading} searchParams={{ minutes: "15", skill: "reading" }} />,
    );

    expect(screen.getByRole("heading", { level: 1, name: extensiveReading.name })).toBeDefined();
    expect(document.body.textContent).toContain(extensiveReading.summary);
    expect(document.body.textContent).toContain(extensiveReading.trains);
    expect(document.body.textContent).toContain(extensiveReading.doesNotDo);
    expect(screen.queryByRole("link", { name: copy.startSession })).toBeNull();
    expect(screen.getByText(copy.sessionNotBuilt)).toBeDefined();
  });

  it("uses the same section graphic as cards in a full-bleed hero", () => {
    render(<MethodDetail method={extensiveReading} />);

    const hero = document.querySelector(".w-screen");
    expect(hero).not.toBeNull();
    expect(hero?.textContent).toContain("Reading");
  });

  it("shows Start for srs-session", () => {
    render(<MethodDetail method={srsSession} />);

    expect(screen.getByRole("link", { name: copy.startSession }).getAttribute("href")).toBe(
      "/words/review?method=srs-session",
    );
  });

  it("preserves filter on back link", () => {
    render(
      <MethodDetail method={extensiveReading} searchParams={{ minutes: "15", skill: "reading" }} />,
    );

    const back = screen.getByRole("link", { name: new RegExp(copy.backToMethods) });
    expect(back.getAttribute("href")).toBe("/methods?minutes=15&skill=reading");
    expect(back.className).toContain("hidden");
    expect(back.className).toContain("md:inline-flex");
  });

  it("shows not-found for an unknown id", () => {
    render(<MethodDetail method={undefined} />);

    expect(screen.getByText(copy.methodNotFound)).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MethodDetail method={extensiveReading} />);
    await expectNoA11yViolations(container);
  });
});
