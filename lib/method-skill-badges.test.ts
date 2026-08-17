import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";

import { isWeakTrains, skillMarksForMethod } from "./method-skill-badges";

const base = {
  type: "method" as const,
  summary: "summary",
  section: "listening" as const,
  trains: "listening",
  targetSignal: null,
  evidence: "B" as const,
  demanding: false,
  hosted: false,
  doesNotDo: "limits",
  intensity: 2 as const,
  durations: [15],
  requires: { sound: ["headphones"] as const },
  offerEveryDays: null,
};

describe("skillMarksForMethod", () => {
  it("marks section primary skill for listening methods", () => {
    const method: MethodEntry = {
      ...base,
      id: "narrow-listening",
      name: "Narrow listening",
      skills: ["listening"],
    };
    expect(skillMarksForMethod(method)).toEqual([{ skill: "listening", level: "primary" }]);
  });

  it("downgrades to slight when trains admits weak yield", () => {
    const method: MethodEntry = {
      ...base,
      id: "background-listening",
      name: "Background listening with no task",
      skills: ["listening"],
      trains: "very little",
      intensity: 1,
    };
    expect(skillMarksForMethod(method)).toEqual([{ skill: "listening", level: "slight" }]);
  });

  it("marks extra skills as secondary", () => {
    const method: MethodEntry = {
      ...base,
      id: "reading-aloud",
      name: "Reading aloud",
      section: "reading",
      skills: ["reading", "speaking"],
      trains: "pronunciation",
    };
    expect(skillMarksForMethod(method)).toEqual([
      { skill: "reading", level: "primary" },
      { skill: "speaking", level: "secondary" },
    ]);
  });

  it("marks vocabulary section primary when skills array is empty", () => {
    const method: MethodEntry = {
      ...base,
      id: "srs-session",
      name: "Spaced repetition session",
      section: "vocabulary",
      skills: [],
      trains: "retention",
    };
    expect(skillMarksForMethod(method)).toEqual([{ skill: "vocabulary", level: "primary" }]);
  });
});

describe("isWeakTrains", () => {
  it("detects honest weak-yield copy", () => {
    expect(isWeakTrains("Honestly: barely anything.")).toBe(true);
    expect(isWeakTrains("listening")).toBe(false);
  });
});
