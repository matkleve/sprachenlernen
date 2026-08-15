import { describe, expect, it } from "vitest";

import {
  buildVocabularyOrbit,
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
  return { lemma, frequencyRank, stability: bucket === "new" ? null : 8, bucket, mature };
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

  it("collapses overflow words into an aggregate segment", () => {
    const atlas = Array.from({ length: 40 }, (_, index) =>
      point(`w${index}`, index + 1, "new"),
    );
    const orbit = buildVocabularyOrbit(atlas, {});
    const inner = orbit.rings[0]!;
    expect(inner.segments.some((s) => s.kind === "aggregate")).toBe(true);
  });
});
