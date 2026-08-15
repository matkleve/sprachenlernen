import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import { skillMarksForMethod } from "@/lib/method-skill-badges";
import { expectNoA11yViolations } from "@/tests/axe";

import {
  EffortDots,
  EvidenceBadge,
  MethodBadgeRow,
  SkillMarkBadge,
} from "./MethodBadge";
import { MethodCard } from "./MethodCard";
import { MethodDetail, findMethod } from "./MethodDetail";
import { loadMethodCatalogue } from "./catalogue";
import { copy } from "./content";

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
    expect(screen.getByText("Evidence C")).toBeDefined();
    expect(screen.getByTitle("Effort: 1 of 3")).toBeDefined();
  });
});

describe("EvidenceBadge", () => {
  it("shows letter and short gloss without pill geometry", () => {
    render(<EvidenceBadge grade="C" />);
    expect(screen.getByText("Evidence C")).toBeDefined();
    expect(screen.getByText("C").className).toContain("font-semibold");
  });
});

describe("EffortDots", () => {
  it("fills one dot for intensity 1", () => {
    const { container } = render(<EffortDots intensity={1} />);
    expect(container.querySelectorAll(".bg-accent")).toHaveLength(1);
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
    expect(link.textContent).toContain("Evidence C");
    expect(link.textContent).not.toContain("plausible and widespread");
  });

  it("shows hero title and at a glance on detail", () => {
    render(<MethodDetail method={method} />);
    expect(screen.getByRole("heading", { level: 1, name: method.name })).toBeDefined();
    expect(screen.getByLabelText(copy.card.atAGlance)).toBeDefined();
    expect(screen.getByText(/plausible and widespread/i)).toBeDefined();
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
