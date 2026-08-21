import { describe, expect, it } from "vitest";

import {
  buildFibreSvgUri,
  buildGrainCssSnippet,
  buildMacroGradient,
  DEFAULT_GRAIN_PARAMS,
  GRAIN_PRESETS,
  grainRepeatHeightPx,
  isHorizontalFibre,
  isHorizontalMacroGradient,
} from "./grain-creator";

describe("grain-creator", () => {
  it("builds horizontal macro valleys (180deg), not vertical map columns", () => {
    const gradient = buildMacroGradient(DEFAULT_GRAIN_PARAMS);
    expect(isHorizontalMacroGradient(gradient)).toBe(true);
    expect(gradient).not.toContain("90deg");
    expect(gradient).toContain("rgb(0 0 0 / 0.52)");
    expect(grainRepeatHeightPx(DEFAULT_GRAIN_PARAMS)).toBe(30);
  });

  it("builds an anisotropic feTurbulence data URI", () => {
    const uri = buildFibreSvgUri(DEFAULT_GRAIN_PARAMS);
    expect(uri).toContain("feTurbulence");
    expect(decodeURIComponent(uri)).toContain("baseFrequency='0.02 0.45'");
    expect(isHorizontalFibre(DEFAULT_GRAIN_PARAMS)).toBe(true);
  });

  it("raw planks have deeper valleys than stock bar", () => {
    expect(GRAIN_PRESETS["raw-planks"].valleyDarkOpacity).toBeGreaterThan(
      GRAIN_PRESETS["stock-bar"].valleyDarkOpacity,
    );
  });

  it("exports a copyable CSS snippet with horizontal macro repeat height", () => {
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(snippet).toContain("repeating-linear-gradient(180deg");
    expect(snippet).toContain("100% 30px");
    expect(snippet).toContain("feTurbulence");
    expect(snippet).toContain(".grain-preview__fibre");
  });
});
