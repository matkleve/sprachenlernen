/**
 * Seeded random numbers. Contract: docs/SIMULATION.md
 *
 * Deterministic by requirement, not by preference: a flaky test about a memory
 * model gets deleted rather than debugged. Every persona carries a seed and the
 * same seed must reproduce the same trajectory exactly.
 *
 * mulberry32 — 32-bit state, fast, good enough for behavioural simulation. Not
 * for anything cryptographic, which nothing here is.
 */

export type Rng = {
  /** Uniform in [0, 1). */
  next: () => number;
  /** Integer in [0, max). */
  int: (max: number) => number;
  /** True with probability p. */
  chance: (p: number) => boolean;
};

export const rngFrom = (seed: number): Rng => {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (max) => Math.floor(next() * max),
    chance: (p) => next() < p,
  };
};
