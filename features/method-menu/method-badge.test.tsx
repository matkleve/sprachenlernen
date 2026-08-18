import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import { expectNoA11yViolations } from "@/tests/axe";

import { EffortBadge, MethodBadgeRow } from "./MethodBadge";
import { MethodCard } from "./MethodCard";
import { MethodDetail, findMethod } from "./MethodDetail";
import { loadMethodCatalogue } from "./catalogue";

const method: MethodEntry = {
  id: "background-listening",
  name: "Background listening with no task",
  summary: "Leave it playing while you do something else",
  type: "method",
  section: "listening",
  trains: "very little",
  skills: ["listening"],
  targetSignal: null,
  evidence: "C",
  demanding: false,
  hosted: false,
  intensity: 1,
  durations: [20, 45],
  requires: { sound: ["speaker", "headphones"] },
  offerEveryDays: null,
  doesNotDo: "Honestly: barely anything.",
};

describe("MethodBadgeRow", () => {
  it("renders tier shields and accent effort pill", () => {
    render(<MethodBadgeRow method={method} />);

    expect(screen.getByRole("img", { name: /Wood Listening/i })).toBeDefined();
    expect(screen.getByLabelText(/Light effort \(1 of 3\)/i)).toBeDefined();
    expect(screen.queryByText(en.methodMenu.evidenceCard.C)).toBeNull();
  });

  it("right-aligns effort on the badge row with accent pill styling", () => {
    const { container } = render(<MethodBadgeRow method={method} />);
    const effort = screen.getByLabelText(/Light effort \(1 of 3\)/i);
    expect(effort.className).toContain("ml-auto");
    expect(effort.className).toContain("text-sm");
    expect(effort.className).toContain("text-accent");
    expect(effort.className).toContain("bg-accent-soft");
    expect(effort.textContent).toBe(en.methodMenu.effortCard[1]);
  });
});

describe("EffortBadge", () => {
  it("shows the short effort label in an accent pill", () => {
    render(<EffortBadge intensity={2} />);
    expect(screen.getByText(en.methodMenu.effortCard[2])).toBeDefined();
    expect(screen.getByLabelText(/Needs focus \(2 of 3\)/i)).toBeDefined();
  });
});

describe("method surfaces", () => {
  it("shows badge row above tag chips on cards", () => {
    render(<MethodCard method={method} />);
    const link = screen.getByRole("link", { name: new RegExp(method.name) });
    expect(link.className).toContain("border-line");
    expect(link.querySelector("h3")?.className).toContain("text-3xl");
    const body = link.querySelector(".flex.flex-1.flex-col");
    expect(body?.className).toContain("p-3");
    expect(link.textContent).toContain(en.methodMenu.effortCard[method.intensity]);
    const chip = link.querySelector("ul[aria-label] span");
    expect(chip?.className).toContain("text-sm");
    expect(link.textContent).not.toContain(en.methodMenu.evidenceCard.C);
    expect(link.textContent).not.toContain("plausible and widespread");
  });

  it("shows article layout on detail with effort badge band and practical facts", async () => {
    render(await MethodDetail({ method }));
    expect(screen.getByRole("heading", { level: 1, name: method.name })).toBeDefined();
    expect(screen.getByLabelText(/Light effort \(1 of 3\)/i)).toBeDefined();
    expect(screen.getAllByText("Thin evidence").length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain("can be done tired or distracted");
    expect(document.body.textContent).toContain(method.trains);
    expect(document.body.textContent).toContain(method.doesNotDo);
    expect(screen.getAllByText(en.methodMenu.detail.researchConfidence).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Evidence C/i)).toBeNull();
  });

  it("has no accessibility violations in isolation", async () => {
    const { container } = render(<MethodBadgeRow method={method} />);
    await expectNoA11yViolations(container);
  });
});

describe("catalogue fixture", () => {
  const { catalogue } = loadMethodCatalogue();
  const extensive = findMethod(catalogue, "extensive-reading")!;

  it("shows a tier shield on extensive reading", () => {
    render(<MethodCard method={extensive} />);
    expect(screen.getByRole("img", { name: /Reading/i })).toBeDefined();
  });
});
