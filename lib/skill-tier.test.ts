import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";

import { skillTiersForMethod, visibleSkillTiers } from "./skill-tier";

const { catalogue } = loadMethodCatalogue();
const narrowListening = findMethod(catalogue, "narrow-listening")!;
const backgroundListening = findMethod(catalogue, "background-listening")!;

describe("skillTiersForMethod", () => {
  it("maps primary listening to gold or platinum", () => {
    const tiers = skillTiersForMethod(narrowListening);
    const listening = tiers.find((mark) => mark.skill === "listening");
    expect(listening?.tier === "gold" || listening?.tier === "platinum").toBe(true);
  });

  it("hides wood tiers from visibleSkillTiers", () => {
    const all = skillTiersForMethod(backgroundListening);
    const listening = all.find((mark) => mark.skill === "listening");
    expect(listening?.tier).toBe("wood");

    const visible = visibleSkillTiers(backgroundListening);
    expect(visible.find((mark) => mark.skill === "listening")).toBeUndefined();
  });
});
