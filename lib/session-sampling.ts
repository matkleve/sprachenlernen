/**
 * Weighted session queue sampling. Contract:
 * docs/specs/service/session-sampling.md
 */

import {
  isFormRecallTaskId,
  isMeaningRecallTaskId,
  meaningRecallTaskIdFor,
} from "@/lib/form-recall-pool";
import type { ReviewDeck } from "@/lib/review-deck";
import type { StarterCard } from "@/lib/starter-deck";
import {
  DEFAULT_CONFIG,
  newTask,
  retrievability,
  type Grade,
  type Task,
} from "@/lib/scheduler";
import { bucketForTask, isTaskHeld } from "@/lib/vocabulary-snapshot";

const SUCCESS_GRADES: ReadonlySet<Grade> = new Set(["hard", "good", "easy"]);

export type SamplingReason =
  | "low-recall"
  | "struggled-today"
  | "new-throttled"
  | "form-staging"
  | "frequency";

export type SamplingConfig = {
  H0: number;
  tau: number;
  betaFragile: number;
  betaStruggled: number;
  betaFirstGood: number;
  lambdaNewToday: number;
  epsilon: number;
  /** Logistic steepness for form staging from meaning success count. */
  formStagingK: number;
  /** Gap-set lemmas get this multiplier on weight (session-builder parity). */
  priorityLemmaBoost: number;
  /** Floor on u when fragile and reviewed today (FSRS R spikes after good). */
  sameDayFragileUMin: number;
};

export const DEFAULT_SAMPLING_CONFIG: SamplingConfig = {
  H0: 50,
  tau: 10,
  betaFragile: 2,
  betaStruggled: 3,
  betaFirstGood: 1,
  lambdaNewToday: 0.2,
  epsilon: 1e-6,
  formStagingK: 2,
  priorityLemmaBoost: 2,
  sameDayFragileUMin: 0.4,
};

export type SamplingContext = {
  heldMeaningRecall: number;
  newFirstReviewCountToday: number;
  gradesTodayByTaskId: Readonly<Record<string, Grade>>;
  config?: SamplingConfig;
};

export type WeightedCandidate = {
  card: StarterCard;
  task: Task;
  weight: number;
  factors: { u: number; b: number; n: number; f: number };
  samplingReason: SamplingReason;
  isNew: boolean;
};

export type SampleSessionOptions = {
  deck?: ReviewDeck;
  priorityLemmas?: ReadonlySet<string>;
  rng?: () => number;
  config?: SamplingConfig;
};

export function phiFoundation(heldMeaningRecall: number, config: SamplingConfig): number {
  const x = (heldMeaningRecall - config.H0) / config.tau;
  return 1 / (1 + Math.exp(x));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function formStagingWeight(
  card: StarterCard,
  tasksByTaskId: Record<string, Task>,
  config: SamplingConfig,
): number {
  if (!isFormRecallTaskId(card.taskId)) return 1;

  const meaningId = meaningRecallTaskIdFor(card);
  const meaningTask = tasksByTaskId[meaningId] ?? newTask(meaningId, card.wordId);
  if (isTaskHeld(meaningTask, DEFAULT_CONFIG)) return 1;

  const successes = meaningTask.reviews.filter((review) =>
    SUCCESS_GRADES.has(review.grade),
  ).length;
  if (successes === 0) return config.epsilon;

  return sigmoid(config.formStagingK * successes);
}

function isFirstSuccessFragile(task: Task, gradeToday: Grade | undefined): boolean {
  if (gradeToday !== "good") return false;
  const successes = task.reviews.filter((review) => SUCCESS_GRADES.has(review.grade)).length;
  return successes === 1;
}

function struggledToday(gradeToday: Grade | undefined): boolean {
  return gradeToday === "again" || gradeToday === "hard";
}

export function computeCandidateWeight(
  card: StarterCard,
  task: Task,
  now: number,
  context: SamplingContext,
  tasksByTaskId: Record<string, Task>,
  options?: Pick<SampleSessionOptions, "priorityLemmas">,
): WeightedCandidate {
  const config = context.config ?? DEFAULT_SAMPLING_CONFIG;
  const gradeToday = context.gradesTodayByTaskId[task.id];
  const isNew = task.reviews.length === 0;

  let u = Math.max(config.epsilon, 1 - retrievability(task, now));
  if (
    !isNew &&
    bucketForTask(task, DEFAULT_CONFIG) === "fragile" &&
    gradeToday !== undefined
  ) {
    // UC-079 R2: without a floor, session 2 after all-good is all new words.
    u = Math.max(u, config.sameDayFragileUMin);
  }
  const phi = phiFoundation(context.heldMeaningRecall, config);
  const fragile = bucketForTask(task, DEFAULT_CONFIG) === "fragile" ? 1 : 0;
  const struggled = struggledToday(gradeToday) ? 1 : 0;
  const firstGoodFragile = isFirstSuccessFragile(task, gradeToday) ? 1 : 0;
  const b =
    1 +
    phi *
      (config.betaFragile * fragile +
        config.betaStruggled * struggled +
        config.betaFirstGood * firstGoodFragile);

  const n =
    isNew
      ? Math.max(
          config.epsilon,
          Math.exp(-config.lambdaNewToday * context.newFirstReviewCountToday),
        )
      : 1;

  const f = formStagingWeight(card, tasksByTaskId, config);

  let weight = u * b * n * f;
  if (isNew) {
    // Soft frequency prior — lower rank more likely, not strict sort (UC-079 AC).
    weight *= 1 / Math.log2(card.frequencyRank + 1);
  }
  if (isNew && options?.priorityLemmas?.has(card.lemma)) {
    weight *= config.priorityLemmaBoost;
  }

  return {
    card,
    task,
    weight,
    factors: { u, b, n, f },
    samplingReason: dominantSamplingReason({
      u,
      b,
      n,
      f,
      isNew,
      isForm: isFormRecallTaskId(card.taskId),
      struggledToday: struggled === 1,
    }),
    isNew,
  };
}

function dominantSamplingReason(input: {
  u: number;
  b: number;
  n: number;
  f: number;
  isNew: boolean;
  isForm: boolean;
  struggledToday: boolean;
}): SamplingReason {
  const scores: Array<[SamplingReason, number]> = [
    ["low-recall", input.u + (input.struggledToday ? 0 : Math.max(0, input.b - 1))],
    ["struggled-today", input.struggledToday ? Math.max(0, input.b - 1) : 0],
    ["new-throttled", input.isNew ? Math.max(0, 1 - input.n) : 0],
    ["form-staging", input.isForm ? Math.max(0, 1 - input.f) : 0],
  ];

  let best: SamplingReason = input.isNew ? "frequency" : "low-recall";
  let bestScore = 0;
  for (const [reason, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      best = reason;
    }
  }
  return best;
}

function poolForDeck(pool: StarterCard[], deck: ReviewDeck): StarterCard[] {
  if (deck === "form") {
    return pool.filter((card) => isFormRecallTaskId(card.taskId));
  }
  if (deck === "meaning") {
    return pool.filter((card) => isMeaningRecallTaskId(card.taskId));
  }
  return pool;
}

function collapseSiblingCandidates(candidates: WeightedCandidate[]): WeightedCandidate[] {
  const bestByWord = new Map<string, WeightedCandidate>();
  for (const candidate of candidates) {
    const existing = bestByWord.get(candidate.card.wordId);
    if (!existing || candidate.weight > existing.weight) {
      bestByWord.set(candidate.card.wordId, candidate);
    }
  }
  return [...bestByWord.values()];
}

function pickWeightedIndex(weights: number[], rng: () => number): number {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return 0;
  let roll = rng() * total;
  for (let index = 0; index < weights.length; index += 1) {
    roll -= weights[index] ?? 0;
    if (roll <= 0) return index;
  }
  return weights.length - 1;
}

export function sampleSession(
  pool: StarterCard[],
  tasksByTaskId: Record<string, Task>,
  now: number,
  sessionLength: number,
  context: SamplingContext,
  options: SampleSessionOptions = {},
): WeightedCandidate[] {
  const deck = options.deck ?? "mixed";
  const config = options.config ?? context.config ?? DEFAULT_SAMPLING_CONFIG;
  const rng = options.rng ?? Math.random;
  const samplingContext = { ...context, config };

  const candidates: WeightedCandidate[] = [];
  for (const card of poolForDeck(pool, deck)) {
    const task = tasksByTaskId[card.taskId] ?? newTask(card.taskId, card.wordId);
    if (task.state === "suspended" || task.state === "retired") continue;
    candidates.push(
      computeCandidateWeight(card, task, now, samplingContext, tasksByTaskId, options),
    );
  }

  const collapsed = collapseSiblingCandidates(candidates);
  const picked: WeightedCandidate[] = [];
  const remaining = [...collapsed];

  while (picked.length < sessionLength && remaining.length > 0) {
    const weights = remaining.map((candidate) => candidate.weight);
    const index = pickWeightedIndex(weights, rng);
    const [choice] = remaining.splice(index, 1);
    if (choice) picked.push(choice);
  }

  return picked;
}
