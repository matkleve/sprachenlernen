/**
 * Picks three methods for the daily menu. Contract:
 * docs/specs/page/method-menu.md § Daily three.
 *
 * study/12 rules, narrowed for v1: no per-learner effect data yet, so "high
 * effect" is proxied by evidence grade (A strongest). Variety is section-based.
 */

import type { EvidenceGrade, MethodEntry, Section } from "@/lib/method-catalogue";

const EVIDENCE_RANK: Record<EvidenceGrade, number> = { A: 4, B: 3, C: 2, D: 1 };

function byId(a: MethodEntry, b: MethodEntry): number {
  return a.id.localeCompare(b.id);
}

function lowestIntensity(methods: readonly MethodEntry[]): MethodEntry {
  return [...methods].sort((a, b) => a.intensity - b.intensity || byId(a, b))[0]!;
}

function strongestEvidence(methods: readonly MethodEntry[]): MethodEntry {
  return [...methods].sort(
    (a, b) => EVIDENCE_RANK[b.evidence] - EVIDENCE_RANK[a.evidence] || byId(a, b),
  )[0]!;
}

function pickThird(
  methods: readonly MethodEntry[],
  taken: ReadonlySet<string>,
  dayKey: string,
): MethodEntry | null {
  const pool = methods.filter((method) => !taken.has(method.id));
  if (pool.length === 0) return null;

  const takenSections = new Set(
    methods.filter((method) => taken.has(method.id)).map((method) => method.section),
  );

  const differentSection = pool.filter((method) => !takenSections.has(method.section));
  const candidates = differentSection.length > 0 ? differentSection : pool;

  const index =
    hashDayKey(dayKey) % candidates.length;
  return [...candidates].sort(byId)[index] ?? null;
}

/** Stable within a calendar day — same three picks for everyone on that day. */
function hashDayKey(dayKey: string): number {
  let hash = 0;
  for (let index = 0; index < dayKey.length; index += 1) {
    hash = (hash * 31 + dayKey.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function pickDailyThree(
  methods: readonly MethodEntry[],
  dayKey: string,
): readonly MethodEntry[] {
  if (methods.length <= 3) return [...methods].sort(byId);

  const low = lowestIntensity(methods);
  const taken = new Set<string>([low.id]);

  const forStrong = methods.filter((method) => !taken.has(method.id));
  const strong = strongestEvidence(forStrong);
  taken.add(strong.id);

  const third = pickThird(methods, taken, dayKey);
  const picks = third ? [low, strong, third] : [low, strong];

  return picks.sort(byId);
}
