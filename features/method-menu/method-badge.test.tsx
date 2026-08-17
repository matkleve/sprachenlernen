import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import { skillMarksForMethod } from "@/lib/method-skill-badges";
import { expectNoA11yViolations } from "@/tests/axe";

import {
  EffortBadge,
  EvidenceBadge,
  MethodBadgeRow,
  SkillMarkBadge,
} from "./MethodBadge";
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
  it("renders skill marks, evidence, and effort in order", () => {
    const marks = skillMarksForMethod(method);
    render(<MethodBadgeRow skillMarks={marks} evidence="C" intensity={1} />);

    expect(screen.getByTitle("Listening, slight")).toBeDefined();
    expect(screen.getByText(en.methodMenu.evidenceCard.C)).toBeDefined();
    expect(screen.getByText(en.methodMenu.effortCard[1])).toBeDefined();
  });
});

describe("EvidenceBadge", () => {
  it("shows plain-language evidence without a letter grade", () => {
    render(<EvidenceBadge grade="C" />);
    expect(screen.getByText(en.methodMenu.evidenceCard.C)).toBeDefined();
    expect(screen.queryByText("Evidence C")).toBeNull();
    expect(screen.queryByText(/^C$/)).toBeNull();
  });
});

describe("EffortBadge", () => {
  it("shows plain-language effort without a dot scale", () => {
    render(<EffortBadge intensity={1} />);
    expect(screen.getByText(en.methodMenu.effortCard[1])).toBeDefined();
    expect(screen.queryByText(/1 of 3/)).toBeNull();
  });
});

describe("SkillMarkBadge", () => {
  it("exposes contribution in the title attribute", () => {
    render(<SkillMarkBadge mark={{ skill: "listening", level: "primary" }} />);
    expect(screen.getByTitle("Listening, primary")).toBeDefined();
  });
});

describe("method surfaces", () => {
  it("shows badge row above tag chips on cards", () => {
    render(<MethodCard method={method} />);
    const link = screen.getByRole("link", { name: new RegExp(method.name) });
    expect(link.className).toContain("border-line");
    expect(link.className).toContain("active:scale-");
    expect(link.textContent).toContain(en.methodMenu.evidenceCard.C);
    expect(link.textContent).toContain(en.methodMenu.effortCard[1]);
    expect(link.textContent).not.toContain("plausible and widespread");
  });

  it("shows article layout on detail with effort badge band and practical facts", async () => {
    render(await MethodDetail({ method }));
    expect(screen.getByRole("heading", { level: 1, name: method.name })).toBeDefined();
    expect(screen.getByText(en.methodMenu.effortCard[1])).toBeDefined();
    expect(screen.getAllByText("Thin evidence").length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain("can be done tired or distracted");
    expect(document.body.textContent).toContain(method.trains);
    expect(document.body.textContent).toContain(method.doesNotDo);
    expect(screen.queryByTitle("Listening, slight")).toBeNull();
    expect(screen.getAllByText(en.methodMenu.detail.researchConfidence).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Evidence C/i)).toBeNull();
    expect(screen.queryByText(/1 of 3/)).toBeNull();
  });

  it("has no accessibility violations in isolation", async () => {
    const marks = skillMarksForMethod(method);
    const { container } = render(
      <MethodBadgeRow skillMarks={marks} evidence="C" intensity={1} />,
    );
    await expectNoA11yViolations(container);
  });
});

describe("catalogue fixture", () => {
  const { catalogue } = loadMethodCatalogue();
  const extensive = findMethod(catalogue, "extensive-reading")!;

  it("shows primary reading mark on extensive reading", () => {
    render(<MethodCard method={extensive} />);
    expect(screen.getByTitle("Reading, primary")).toBeDefined();
  });
});
