import { describe, expect, it } from "vitest";

import {
  buildGrainCssSnippet,
  buildMacroNoiseUri,
  buildMicroNoiseUri,
  buildNoiseBackgroundRepeat,
  DEFAULT_GRAIN_PARAMS,
  GRAIN_PRESETS,
  isAnisotropicAlongFibre,
  noiseUriToImageSrc,
  usesProceduralNoiseOnly,
  usesStretchSizing,
} from "./grain-creator";

describe("grain-creator", () => {
  it("builds macro terrain from feTurbulence with gamma shaping", () => {
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(usesProceduralNoiseOnly(snippet)).toBe(true);
    expect(buildMacroNoiseUri(DEFAULT_GRAIN_PARAMS)).toContain("feComponentTransfer");
    expect(buildMicroNoiseUri(DEFAULT_GRAIN_PARAMS)).toContain("fractalNoise");
  });

  it("defaults to stretch sizing so preview has no repeat seam", () => {
    expect(usesStretchSizing(DEFAULT_GRAIN_PARAMS)).toBe(true);
    expect(buildNoiseBackgroundRepeat("stretch")).toBe("no-repeat");
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(snippet).toContain("background-size: 100% 100%");
    expect(snippet).toContain("background-repeat: no-repeat");
  });

  it("raw planks carve deeper valleys than stock bar via macro contrast", () => {
    expect(GRAIN_PRESETS["raw-planks"].macroContrast).toBeGreaterThan(
      GRAIN_PRESETS["stock-bar"].macroContrast,
    );
    expect(GRAIN_PRESETS["raw-planks"].macroValleySharpness).toBeGreaterThan(
      GRAIN_PRESETS["stock-bar"].macroValleySharpness,
    );
  });

  it("uses anisotropic frequencies along the fibre", () => {
    expect(isAnisotropicAlongFibre(DEFAULT_GRAIN_PARAMS.macroFreqX, DEFAULT_GRAIN_PARAMS.macroFreqY)).toBe(
      true,
    );
  });

  it("strips css url wrapper for canvas image loading", () => {
    expect(noiseUriToImageSrc('url("data:image/svg+xml,abc")')).toBe("data:image/svg+xml,abc");
  });
});
