import { describe, expect, it } from "vitest";

import {
  chapterForMaterialStage,
  materialRecipeForStage,
  materialStageStyle,
  MAX_MATERIAL_STAGE,
  MIN_MATERIAL_STAGE,
} from "@/lib/material-recipes";

/** Contract: docs/specs/page/material-explorer.md § Acceptance criteria */

describe("material-recipes", () => {
  it("maps stages 1–3 to Workshop, 4–6 to Library, 7–9 to Observatory", () => {
    expect(chapterForMaterialStage(1).id).toBe("workshop");
    expect(chapterForMaterialStage(3).id).toBe("workshop");
    expect(chapterForMaterialStage(4).id).toBe("library");
    expect(chapterForMaterialStage(6).id).toBe("library");
    expect(chapterForMaterialStage(7).id).toBe("observatory");
    expect(chapterForMaterialStage(9).id).toBe("observatory");
  });

  it("defines nine recipes from MIN to MAX stage", () => {
    for (let stage = MIN_MATERIAL_STAGE; stage <= MAX_MATERIAL_STAGE; stage++) {
      expect(materialRecipeForStage(stage).stage).toBe(stage);
    }
  });

  it("makes stage 1 rougher than stage 3", () => {
    const raw = materialRecipeForStage(1);
    const oiled = materialRecipeForStage(3);
    expect(raw.roughness).toBeGreaterThan(oiled.roughness);
    expect(raw.grain).toBeGreaterThan(oiled.grain);
    expect(oiled.specular).toBeGreaterThan(raw.specular);
  });

  it("gives stage 9 higher specular than stage 7", () => {
    const dark = materialRecipeForStage(7);
    const premium = materialRecipeForStage(9);
    expect(premium.specular).toBeGreaterThan(dark.specular);
  });

  it("adds stars only in Observatory stages 8–9", () => {
    expect(materialRecipeForStage(7).stars).toBe(0);
    expect(materialRecipeForStage(8).stars).toBeGreaterThan(0);
    expect(materialRecipeForStage(9).stars).toBeGreaterThan(materialRecipeForStage(8).stars);
  });

  it("differs grain between workshop stages 1 and 2", () => {
    const s1 = materialRecipeForStage(1);
    const s2 = materialRecipeForStage(2);
    expect(s1.grain).not.toBe(s2.grain);
  });

  it("exports numeric knobs as CSS custom properties", () => {
    const style = materialStageStyle(3);
    expect(style["--material-roughness"]).toBe("0.45");
    expect(style["--material-radius"]).toBe("16px");
  });
});
