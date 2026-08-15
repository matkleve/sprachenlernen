/**
 * Polar orbit layout for the Words home. Contract:
 * docs/specs/feature/vocabulary-orbit.md
 */

import type { AtlasPoint, VocabularyBucket } from "@/lib/vocabulary-snapshot";

export const ORBIT_RING_COUNT = 8;

/** Inner ring = highest frequency. Matches the shipped 2000-lemma pool. */
export const ORBIT_RING_BANDS: readonly { rankStart: number; rankEnd: number }[] = [
  { rankStart: 1, rankEnd: 25 },
  { rankStart: 26, rankEnd: 75 },
  { rankStart: 76, rankEnd: 150 },
  { rankStart: 151, rankEnd: 300 },
  { rankStart: 301, rankEnd: 500 },
  { rankStart: 501, rankEnd: 800 },
  { rankStart: 801, rankEnd: 1200 },
  { rankStart: 1201, rankEnd: 2000 },
] as const;

/** Decorative ticks per ring — dense App Clip-style band. */
export const ORBIT_SLOTS_PER_RING = [24, 28, 32, 36, 40, 44, 48, 52] as const;

/** Each ring starts at a different phase so ticks never line up radially. */
export function ringPhaseOffset(ringIndex: number): number {
  return (ringIndex * 23.7 + 11) % 360;
}

export const ORBIT_MAX_INDIVIDUALS = 24;

export type OrbitLit = "ghost" | "half" | "lit" | "bright";

export type OrbitWordSegment = {
  kind: "word";
  id: string;
  ringIndex: number;
  slotIndex: number;
  lemma: string;
  translation: string;
  frequencyRank: number;
  stability: number | null;
  bucket: VocabularyBucket;
  mature: boolean;
  lit: OrbitLit;
};

export type OrbitAggregateSegment = {
  kind: "aggregate";
  id: string;
  ringIndex: number;
  slotIndex: number;
  rankStart: number;
  rankEnd: number;
  wordCount: number;
  heldCount: number;
  lit: OrbitLit;
};

/** Decorative ghost tick — fills the band between data segments. */
export type OrbitTickSegment = {
  kind: "tick";
  id: string;
  ringIndex: number;
  slotIndex: number;
  lit: "ghost";
};

export type OrbitSegment = OrbitWordSegment | OrbitAggregateSegment | OrbitTickSegment;

export type OrbitRing = {
  index: number;
  rankStart: number;
  rankEnd: number;
  /** Share of lemmas in this band that are held or mature (0–1). */
  fillRatio: number;
  segments: readonly OrbitSegment[];
};

export type VocabularyOrbit = {
  rings: readonly OrbitRing[];
};

export function orbitLitForPoint(point: AtlasPoint): OrbitLit {
  if (point.mature) return "bright";
  if (point.bucket === "held") return "lit";
  if (point.bucket === "fragile") return "half";
  return "ghost";
}

function aggregateLit(points: readonly AtlasPoint[]): OrbitLit {
  if (points.length === 0) return "ghost";
  const heldOrMature = points.filter((p) => p.bucket === "held" || p.mature).length;
  const ratio = heldOrMature / points.length;
  if (ratio >= 0.75) return "bright";
  if (ratio >= 0.4) return "lit";
  if (ratio > 0) return "half";
  return "ghost";
}

function pointsInBand(atlas: readonly AtlasPoint[], rankStart: number, rankEnd: number): AtlasPoint[] {
  return atlas.filter(
    (point) => point.frequencyRank >= rankStart && point.frequencyRank <= rankEnd,
  );
}

function ringFillRatio(points: readonly AtlasPoint[]): number {
  if (points.length === 0) return 0;
  const held = points.filter((point) => point.bucket === "held" || point.mature).length;
  return held / points.length;
}

export function buildVocabularyOrbit(
  atlas: readonly AtlasPoint[],
  translations: Readonly<Record<string, string>>,
): VocabularyOrbit {
  const rings: OrbitRing[] = [];

  for (let ringIndex = 0; ringIndex < ORBIT_RING_COUNT; ringIndex++) {
    const band = ORBIT_RING_BANDS[ringIndex]!;
    const points = pointsInBand(atlas, band.rankStart, band.rankEnd);
    const slotBudget = Math.min(ORBIT_MAX_INDIVIDUALS, ORBIT_SLOTS_PER_RING[ringIndex]!);
    const individuals = points.slice(0, Math.max(0, slotBudget - 1));
    const remainder = points.slice(individuals.length);
    const segments: OrbitSegment[] = individuals.map((point, slotIndex) => ({
      kind: "word",
      id: `word:${point.lemma}:${point.frequencyRank}`,
      ringIndex,
      slotIndex,
      lemma: point.lemma,
      translation: translations[point.lemma] ?? "",
      frequencyRank: point.frequencyRank,
      stability: point.stability,
      bucket: point.bucket,
      mature: point.mature,
      lit: orbitLitForPoint(point),
    }));

    if (remainder.length > 0) {
      const heldCount = remainder.filter((p) => p.bucket === "held" || p.mature).length;
      segments.push({
        kind: "aggregate",
        id: `agg:${band.rankStart}-${band.rankEnd}`,
        ringIndex,
        slotIndex: segments.length,
        rankStart: remainder[0]!.frequencyRank,
        rankEnd: remainder[remainder.length - 1]!.frequencyRank,
        wordCount: remainder.length,
        heldCount,
        lit: aggregateLit(remainder),
      });
    }

    const slotCount = ORBIT_SLOTS_PER_RING[ringIndex]!;
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
      if (segments.some((segment) => segment.slotIndex === slotIndex)) continue;
      segments.push({
        kind: "tick",
        id: `tick:${ringIndex}:${slotIndex}`,
        ringIndex,
        slotIndex,
        lit: "ghost",
      });
    }

    segments.sort((a, b) => a.slotIndex - b.slotIndex);

    rings.push({
      index: ringIndex,
      rankStart: band.rankStart,
      rankEnd: band.rankEnd,
      fillRatio: ringFillRatio(points),
      segments,
    });
  }

  return { rings };
}

/** Deterministic slot angular width — dots, short dashes, and long dashes mixed. */
export function slotAngularWidth(ringIndex: number, slotIndex: number, slotCount: number): number {
  const hash = (ringIndex * 31 + slotIndex * 17) % 11;
  if (hash <= 2) return 1.8;
  if (hash <= 6) return 4.2 + (hash % 3) * 0.8;
  return 7.5 + (hash % 4) * 1.1;
}

export function slotStartAngle(
  ringIndex: number,
  slotIndex: number,
  slotCount: number,
): number {
  const phase = ringPhaseOffset(ringIndex);
  const gap = 2.8;
  let angle = phase;
  for (let i = 0; i < slotIndex; i++) {
    angle += slotAngularWidth(ringIndex, i, slotCount) + gap;
  }
  return angle % 360;
}
