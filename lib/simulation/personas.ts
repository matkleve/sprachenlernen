/**
 * Personas. Contract: docs/SIMULATION.md
 *
 * Adversarial scenario parameters, NOT a representative sample and NOT claims
 * about people (ADR-0008 rule 6). Every persona carries the failure it exists to
 * catch, because a persona with no target failure is decoration that costs
 * runtime (docs/SIMULATION.md, rule 3).
 */

import type { Aptitude } from "@/lib/simulation/learner";

export type Persona = {
  name: string;
  /** The failure this persona exists to catch. Required — see SIMULATION.md. */
  catches: string;
  aptitude: Aptitude;
  /** Probability of studying at all on a given day. */
  attendance: number;
  /** Reviews they are willing to do in one day. */
  dailyBudget: number;
  /** New words taken on per study day, budget permitting. */
  newPerDay: number;
  /** Probability of collapsing a graded success onto "good". */
  optimism: number;
  /** Days on / days off, for learners who vanish. `undefined` = no cycle. */
  cycle?: { onDays: number; offDays: number };
};

/**
 * The baseline is defined as **a learner the published FSRS defaults describe**,
 * not as an average of anything we measured. Those defaults are fitted to a large
 * body of real review histories, so `initialStability` matches FSRS's S₀ for a
 * "good" first answer and the growth rate is of the same order as its own.
 *
 * Choosing the constants any other way would be inventing a population, and then
 * every calibration figure would be a statement about that invention. Deviations
 * from real memory belong in the *deviating* personas below, where they are
 * labelled.
 */
const baseline: Aptitude = { learningRate: 3, forgettingRate: 1.5, initialStability: 3.7 };

export const PERSONAS: readonly Persona[] = [
  {
    name: "diligent",
    catches: "the baseline — anything failing here is broken outright",
    aptitude: baseline,
    attendance: 1,
    dailyBudget: 60,
    newPerDay: 10,
    optimism: 0.1,
  },
  {
    name: "weekender",
    catches: "whether intervals survive lumpy attendance",
    aptitude: baseline,
    attendance: 2 / 7,
    dailyBudget: 120,
    newPerDay: 20,
    optimism: 0.1,
  },
  {
    name: "trickler",
    catches: "a backlog that grows without bound under a tiny budget",
    aptitude: baseline,
    attendance: 1,
    dailyBudget: 8,
    newPerDay: 3,
    optimism: 0.15,
  },
  {
    name: "disappearer",
    catches: "recovery after a long gap, and levels that fall (UC-006)",
    aptitude: baseline,
    attendance: 1,
    dailyBudget: 40,
    newPerDay: 8,
    optimism: 0.1,
    cycle: { onDays: 21, offDays: 21 },
  },
  {
    name: "optimist",
    catches: "grade reports decoupled from true recall",
    aptitude: baseline,
    attendance: 0.8,
    dailyBudget: 40,
    newPerDay: 8,
    optimism: 0.95,
  },
  {
    name: "struggler",
    catches: "suspension, and repair paths that never fire (UC-013)",
    aptitude: { learningRate: 0.8, forgettingRate: 3, initialStability: 1 },
    attendance: 0.9,
    dailyBudget: 30,
    newPerDay: 6,
    optimism: 0.1,
  },
  {
    name: "bailer",
    catches: "sessions that quietly run past their stated length",
    aptitude: baseline,
    attendance: 0.9,
    dailyBudget: 12,
    newPerDay: 15,
    optimism: 0.2,
  },
];
