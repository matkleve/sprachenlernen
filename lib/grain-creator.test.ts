import { describe, expect, it } from "vitest";

import {
  buildGrainCssSnippet,
  buildMacroNoiseUri,
  buildMicroNoiseUri,
  DEFAULT_GRAIN_PARAMS,
  GRAIN_PRESETS,
  isAnisotropicAlongFibre,
  usesProceduralNoiseOnly,
} from "./grain-creator";

describe("grain-creator", () => {
  it("builds macro terrain from feTurbulence fractalNoise, not stripe gradients", () => {
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(usesProceduralNoiseOnly(snippet)).toBe(true);
    expect(buildMacroNoiseUri(DEFAULT_GRAIN_PARAMS)).toContain("feTurbulence");
    expect(buildMicroNoiseUri(DEFAULT_GRAIN_PARAMS)).toContain("fractalNoise");
  });

  it("uses anisotropic frequencies so detail elongates along the fibre", () => {
    expect(isAnisotropicAlongFibre(DEFAULT_GRAIN_PARAMS.macroFreqX, DEFAULT_GRAIN_PARAMS.macroFreqY)).toBe(
      true,
    );
    expect(isAnisotropicAlongFibre(DEFAULT_GRAIN_PARAMS.microFreqX, DEFAULT_GRAIN_PARAMS.microFreqY)).toBe(
      true,
    );
  });

  it("raw planks carve deeper valleys than stock bar via macro contrast", () => {
    expect(GRAIN_PRESETS["raw-planks"].macroContrast).toBeGreaterThan(
      GRAIN_PRESETS["stock-bar"].macroContrast,
    );
  });

  it("exports split macro and micro noise layers with contrast filters", () => {
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(snippet).toContain(".grain-preview__macro");
    expect(snippet).toContain(".grain-preview__micro");
    expect(snippet).toContain("filter: contrast(2.4)");
  });
});
