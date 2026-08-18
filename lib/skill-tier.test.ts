import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import type { MethodEntry } from "@/lib/method-catalogue";

import {
  displaySkillTierMarks,
  skillTiersForMethod,
  tierRank,
} from "./skill-tier";

const { catalogue } = loadMethodCatalogue();
const narrowListening = findMethod(catalogue, "narrow-listening")!;
const backgroundListening = findMethod(catalogue, "background-listening")!;
const fullDictation = findMethod(catalogue, "full-dictation")!;

describe("skillTiersForMethod", () => {
  it("maps primary listening with evidence B to gold", () => {
    const tiers = skillTiersForMethod(narrowListening);
    expect(tiers.find((mark) => mark.skill === "listening")?.tier).toBe("gold");
  });

  it("maps weak background listening to wood", () => {
    const tiers = skillTiersForMethod(backgroundListening);
    expect(tiers.find((mark) => mark.skill === "listening")?.tier).toBe("wood");
  });

  it("maps primary with evidence A to platinum when not weak", () => {
    const platinumMethod = {
      ...narrowListening,
      evidence: "A" as const,
    };
    expect(skillTiersForMethod(platinumMethod)[0]?.tier).toBe("platinum");
  });
});

describe("displaySkillTierMarks", () => {
  it("shows wood when only one skill qualifies", () => {
    const { visible, overflow } = displaySkillTierMarks(backgroundListening);
    expect(visible).toEqual([{ skill: "listening", tier: "wood" }]);
    expect(overflow).toEqual([]);
  });

  it("ranks higher tiers first and caps at three", () => {
    const crowded: MethodEntry = {
      ...fullDictation,
      skills: ["reading", "listening", "speaking", "writing"],
      section: "reading",
      evidence: "B",
      trains: "reading, listening, speaking, writing",
    };
    const { visible, overflow } = displaySkillTierMarks(crowded);
    expect(visible).toHaveLength(3);
    expect(overflow.length).toBeGreaterThan(0);
    expect(tierRank(visible[0]!.tier)).toBeGreaterThanOrEqual(tierRank(visible[1]!.tier));
    expect(tierRank(visible[1]!.tier)).toBeGreaterThanOrEqual(tierRank(visible[2]!.tier));
  });

  it("drops wood when three or more shields qualify", () => {
    const mixed: MethodEntry = {
      ...fullDictation,
      skills: ["listening", "writing", "speaking"],
      section: "listening",
      evidence: "B",
    };
    const { visible } = displaySkillTierMarks(mixed);
    expect(visible.some((mark) => mark.tier === "wood")).toBe(false);
  });
});
