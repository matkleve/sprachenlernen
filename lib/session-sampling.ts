/**
 * Weighted session card selection. Contract:
 * docs/specs/service/session-sampling.md
 */

import { isFormRecallTaskId } from "@/lib/form-recall-pool";
import { worldMatchFactor, type LearnerWorldId } from "@/lib/learner-world";
import { retrievability, type Grade, type Task } from "@/lib/scheduler";
import type { StarterCard } from "@/lib/starter-deck";
import { bucketForTask } from "@/lib/vocabulary-snapshot";

export type SamplingReason =
  | "low-recall"
  | "struggled-today"
  | "new-throttled"
  | "form-staging"
  | "frequency";

export type SamplingConfig = {
  epsilon: number;
  H0: number;
  tau: number;
  betaFragile: number;
  betaStruggled: number;
  betaFirstGood: number;
  lambdaNewToday: number;
  formStagingK: number;
  /** UC-006 / T-W12 — scales urgency by days past `due` (supplement α). */
  alphaOverdue: number;
};

export const DEFAULT_SAMPLING_CONFIG: SamplingConfig = {
  epsilon: 1e-6,
  H0: 50,
  tau: 10,
  betaFragile: 2,
  betaStruggled: 3,
  betaFirstGood: 1,
  lambdaNewToday: 0.2,
  formStagingK: 4,
  alphaOverdue: 0.08,
};

const MS_PER_DAY = 86_400_000;

export type SamplingContext = {
  now: number;
  heldMeaningRecall: number;
  newFirstReviewCountToday: number;
  gradesTodayByTaskId: ReadonlyMap<string, Grade>;
  meaningSuccessCountByWordId: ReadonlyMap<string, number>;
  reviewCountByTaskId: ReadonlyMap<string, number>;
  config?: SamplingConfig;
  rng?: () => number;
  /** Tests only — bypass weighted roll. */
  pickIndex?: (weights: readonly number[]) => number;
  /** T-W24 — default `general` keeps worldMatch at 1. */
  activeWorld?: LearnerWorldId;
};

export type WeightedCandidate = {
  card: StarterCard;
  task: Task;
  isNew: boolean;
  weight: number;
  reason: SamplingReason;
};

export type SampleSessionInput = {
  candidates: readonly { card: StarterCard; task: Task; isNew: boolean }[];
  context: SamplingContext;
  sessionLength: number;
};

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function phiHeld(held: number, config: SamplingConfig): number {
  return 1 / (1 + Math.exp((held - config.H0) / config.tau));
}

function frequencyFactor(rank: number): number {
  return 1 / Math.max(1, rank);
}

function struggledToday(taskId: string, context: SamplingContext): boolean {
  const grade = context.gradesTodayByTaskId.get(taskId);
  return grade === "again" || grade === "hard";
}

function firstSuccessFragile(taskId: string, context: SamplingContext): boolean {
  const gradeToday = context.gradesTodayByTaskId.get(taskId);
  if (gradeToday !== "good") return false;
  return (context.reviewCountByTaskId.get(taskId) ?? 0) === 1;
}

function meaningSuccesses(wordId: string, context: SamplingContext): number {
  return context.meaningSuccessCountByWordId.get(wordId) ?? 0;
}

function daysOverdue(task: Task, now: number, isNew: boolean): number {
  if (isNew || task.due >= now) return 0;
  return (now - task.due) / MS_PER_DAY;
}

function computeFactors(
  candidate: { card: StarterCard; task: Task; isNew: boolean },
  context: SamplingContext,
  config: SamplingConfig,
): { u: number; b: number; n: number; f: number; freq: number; world: number } {
  const { task, card, isNew } = candidate;
  const overdueDays = daysOverdue(task, context.now, isNew);
  const u =
    Math.max(config.epsilon, 1 - retrievability(task, context.now))
    * (1 + config.alphaOverdue * overdueDays);
  const phi = phiHeld(context.heldMeaningRecall, config);
  const fragile = bucketForTask(task) === "fragile" ? 1 : 0;
  const struggled = struggledToday(card.taskId, context) ? 1 : 0;
  const firstGood = firstSuccessFragile(card.taskId, context) ? 1 : 0;
  const b =
    1
    + phi
      * (config.betaFragile * fragile
        + config.betaStruggled * struggled
        + config.betaFirstGood * firstGood);
  const n = isNew ? Math.exp(-config.lambdaNewToday * context.newFirstReviewCountToday) : 1;

  let f = 1;
  if (isFormRecallTaskId(card.taskId)) {
    const successes = meaningSuccesses(card.wordId, context);
    f = logistic(config.formStagingK * (successes - 1));
  }

  const freq = isNew || overdueDays > 0 ? frequencyFactor(card.frequencyRank) : 1;
  const activeWorld = context.activeWorld ?? "general";
  const world = worldMatchFactor(card.worlds, activeWorld);
  return { u, b, n, f, freq, world };
}

function dominantReason(factors: ReturnType<typeof computeFactors>): SamplingReason {
  const { u, b, n, f, freq } = factors;
  const entries: [SamplingReason, number][] = [
    ["low-recall", u],
    ["struggled-today", b - 1],
    ["new-throttled", 1 - n],
    ["form-staging", 1 - f],
    ["frequency", freq - 1],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "low-recall";
}

export function weightCandidate(
  candidate: { card: StarterCard; task: Task; isNew: boolean },
  context: SamplingContext,
): WeightedCandidate {
  const config = context.config ?? DEFAULT_SAMPLING_CONFIG;
  const factors = computeFactors(candidate, context, config);
  const weight = Math.max(
    config.epsilon,
    factors.u * factors.b * factors.n * factors.f * factors.freq * factors.world,
  );
  return {
    ...candidate,
    weight,
    reason: dominantReason(factors),
  };
}

/** One candidate per wordId — keeps the highest-weight sibling. */
export function collapseSiblingCandidates(
  candidates: readonly { card: StarterCard; task: Task; isNew: boolean }[],
  context: SamplingContext,
): WeightedCandidate[] {
  const bestByWord = new Map<string, WeightedCandidate>();
  for (const candidate of candidates) {
    const weighted = weightCandidate(candidate, context);
    const existing = bestByWord.get(candidate.card.wordId);
    if (!existing || weighted.weight > existing.weight) {
      bestByWord.set(candidate.card.wordId, weighted);
    }
  }
  return [...bestByWord.values()];
}

function pickWeightedIndex(weights: number[], context: SamplingContext): number {
  if (context.pickIndex) return context.pickIndex(weights);
  const rng = context.rng ?? Math.random;
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return 0;
  let roll = rng() * total;
  for (let index = 0; index < weights.length; index += 1) {
    roll -= weights[index] ?? 0;
    if (roll <= 0) return index;
  }
  return weights.length - 1;
}

export function sampleSession(input: SampleSessionInput): WeightedCandidate[] {
  const { context, sessionLength } = input;
  const pool = collapseSiblingCandidates(input.candidates, context);
  const picked: WeightedCandidate[] = [];

  while (picked.length < sessionLength && pool.length > 0) {
    const weights = pool.map((entry) => entry.weight);
    const index = pickWeightedIndex(weights, context);
    const [choice] = pool.splice(index, 1);
    if (choice) picked.push(choice);
  }

  return picked;
}

/** Schedulable pool entry — due or new, not suspended/retired. */
export function isSamplingCandidate(task: Task): "due" | "new" | "skip" {
  if (task.state === "suspended" || task.state === "retired") return "skip";
  if (task.reviews.length === 0) return "new";
  return "due";
}
