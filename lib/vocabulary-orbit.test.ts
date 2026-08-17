import { describe, expect, it } from "vitest";

import {
  buildVocabularyOrbit,
  orbitBandForRank,
  orbitLitForPoint,
  ORBIT_RING_COUNT,
} from "@/lib/vocabulary-orbit";
import type { AtlasPoint } from "@/lib/vocabulary-snapshot";

function point(
  lemma: string,
  frequencyRank: number,
  bucket: AtlasPoint["bucket"],
  mature = false,
): AtlasPoint {
  return {
    lemma,
    taskId: `es:${lemma}:meaning-recall`,
    frequencyRank,
    stability: bucket === "new" ? null : 8,
    bucket,
    mature,
    taskState: bucket === "new" ? "new" : "review",
    due: Date.UTC(2026, 7, 12),
    lastGrade: bucket === "new" ? null : "good",
    reviewCount: bucket === "new" ? 0 : 2,
  };
}

describe("vocabulary-orbit", () => {
  it("builds eight rings from atlas points", () => {
    const atlas: AtlasPoint[] = [
      point("el", 1, "held", true),
      point("de", 2, "fragile"),
      point("que", 3, "new"),
    ];
    const orbit = buildVocabularyOrbit(atlas, { el: "the", de: "of", que: "that" });
    expect(orbit.rings).toHaveLength(ORBIT_RING_COUNT);
    expect(orbit.rings[0]?.segments.some((s) => s.kind === "word" && s.lemma === "el")).toBe(true);
  });

  it("maps bucket to lit tier", () => {
    expect(orbitLitForPoint(point("a", 1, "new"))).toBe("ghost");
    expect(orbitLitForPoint(point("b", 2, "fragile"))).toBe("half");
    expect(orbitLitForPoint(point("c", 3, "held"))).toBe("lit");
    expect(orbitLitForPoint(point("d", 4, "held", true))).toBe("bright");
  });

  it("fills empty slots with decorative ghost ticks", () => {
    const atlas: AtlasPoint[] = [
      {
        lemma: "el",
        taskId: "es:el:meaning-recall",
        frequencyRank: 1,
        stability: null,
        bucket: "new",
        mature: false,
        taskState: "new",
        due: Date.UTC(2026, 7, 12),
        lastGrade: null,
        reviewCount: 0,
      },
    ];
    const orbit = buildVocabularyOrbit(atlas, { el: "the" });
    const inner = orbit.rings[0]!;
    expect(inner.segments.some((s) => s.kind === "tick")).toBe(true);
    expect(inner.segments.some((s) => s.kind === "word")).toBe(true);
  });

  it("maps a rank to its orbit band", () => {
    expect(orbitBandForRank(1)).toEqual({ rankStart: 1, rankEnd: 25 });
    expect(orbitBandForRank(500)).toEqual({ rankStart: 301, rankEnd: 500 });
    expect(orbitBandForRank(9999)).toBeNull();
  });
});
