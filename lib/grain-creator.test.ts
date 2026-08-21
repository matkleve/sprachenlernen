import { describe, expect, it } from "vitest";

import {
  buildFibreSvgUri,
  buildGrainCssSnippet,
  buildMacroGradient,
  DEFAULT_GRAIN_PARAMS,
  GRAIN_PRESETS,
  grainRepeatWidthPx,
  isHorizontalFibre,
} from "./grain-creator";

describe("grain-creator", () => {
  it("builds a horizontal repeating macro gradient", () => {
    const gradient = buildMacroGradient(DEFAULT_GRAIN_PARAMS);
    expect(gradient).toContain("repeating-linear-gradient(90deg");
    expect(gradient).toContain("rgb(0 0 0 / 0.45)");
    expect(grainRepeatWidthPx(DEFAULT_GRAIN_PARAMS)).toBe(392);
  });

  it("builds an anisotropic feTurbulence data URI", () => {
    const uri = buildFibreSvgUri(DEFAULT_GRAIN_PARAMS);
    expect(uri).toContain("feTurbulence");
    expect(decodeURIComponent(uri)).toContain("baseFrequency='0.02 0.45'");
    expect(isHorizontalFibre(DEFAULT_GRAIN_PARAMS)).toBe(true);
  });

  it("raw planks have darker seams than oiled timber", () => {
    expect(GRAIN_PRESETS["raw-planks"].seamDarkOpacity).toBeGreaterThan(
      GRAIN_PRESETS["oiled-timber"].seamDarkOpacity,
    );
  });

  it("exports a copyable CSS snippet with both layers", () => {
    const snippet = buildGrainCssSnippet(DEFAULT_GRAIN_PARAMS);
    expect(snippet).toContain("repeating-linear-gradient(90deg");
    expect(snippet).toContain("feTurbulence");
    expect(snippet).toContain(".grain-preview__fibre");
  });
});
