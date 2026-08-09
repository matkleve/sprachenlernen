/**
 * The level model, as far as the data reaches. Contract:
 * docs/specs/page/progress.md. Derives docs/study/03-level-model.md, which owns
 * every rule here — this file computes, it does not decide.
 *
 * Framework-free and I/O-free: it takes rebuilt Tasks and returns readings.
 * Copy for any of it lives in features/progress/content.ts.
 */

import type { Task } from "@/lib/scheduler";

export const SKILLS = ["reading", "listening", "speaking", "writing"] as const;
export type Skill = (typeof SKILLS)[number];

/** study/03 § Layer 1, in the order the chapter lists them. */
export const LAYER_1_SIGNALS = [
  "vocabulary-size",
  "form-mastery",
  "recall-stability",
  "lexical-coverage",
  "response-time",
  "success-by-difficulty",
  "production-quality",
] as const;
export type SignalId = (typeof LAYER_1_SIGNALS)[number];

/** study/03 § The status of a skill — defined there, spelled here. */
export type SkillStatus = "measured" | "uncertain" | "not-measured" | "not-in-profile";

/**
 * Which layer-1 signals feed which skill.
 *
 * This map holds **only the assignments study/03 states outright** — lexical
 * coverage as "the direct predictor of reading comprehension", production
 * quality as "the only layer-1 quantity for speaking and writing". The rest of
 * the chapter's signals are inputs to the model without a skill named against
 * them, and guessing the missing rows is how the one signal we happen to be
 * able to compute would end up attached to a skill so the page has something
 * to show. Listening is the conspicuous hole and is a spec gap, not an
 * oversight: no signal in the chapter is assigned to it.
 */
const SIGNALS_FEEDING: Record<Skill, readonly SignalId[]> = {
  reading: ["lexical-coverage"],
  listening: [],
  speaking: ["production-quality"],
  writing: ["production-quality"],
};

export function signalsFeedingSkill(skill: Skill): readonly SignalId[] {
  return SIGNALS_FEEDING[skill];
}

export type SignalReading = {
  id: SignalId;
  status: "has-data" | "no-data";
  /** Unit is per signal; today only recall stability has one, in days. */
  value: number | null;
  /** How many Tasks the value was computed from — the derivation, not a score. */
  taskCount: number;
};

export type SkillReading = {
  skill: Skill;
  status: SkillStatus;
  /** What would have to start arriving for this skill to be measurable. */
  feedingSignals: readonly SignalId[];
};

export type OverallReading =
  | { status: "withheld"; reason: "fewer-than-two-counting-skills" }
  | { status: "level"; countedSkills: readonly Skill[] };

export type LevelReading = {
  skills: readonly SkillReading[];
  signals: readonly SignalReading[];
  overall: OverallReading;
};

/** The skills that enter the overall formula — study/03 § Layer 3. */
export function countingSkills(skills: readonly SkillReading[]): readonly Skill[] {
  return skills
    .filter((skill) => skill.status === "measured" || skill.status === "uncertain")
    .map((skill) => skill.skill);
}

function readRecallStability(tasks: readonly Task[]): SignalReading {
  // Only Tasks that have actually been reviewed carry a stability. A new Task
  // has none, and treating that as zero would drag the figure down every time
  // the learner meets a new word — a measurement that falls on encountering
  // something new is measuring the wrong thing.
  const stabilities = tasks
    .filter((task) => task.reviews.length > 0 && typeof task.stability === "number")
    .map((task) => task.stability as number);

  if (stabilities.length === 0) {
    return { id: "recall-stability", status: "no-data", value: null, taskCount: 0 };
  }

  const mean = stabilities.reduce((total, value) => total + value, 0) / stabilities.length;

  return {
    id: "recall-stability",
    status: "has-data",
    value: mean,
    taskCount: stabilities.length,
  };
}

function readSignals(tasks: readonly Task[]): readonly SignalReading[] {
  const recallStability = readRecallStability(tasks);

  return LAYER_1_SIGNALS.map((id) => {
    if (id === "recall-stability") return recallStability;

    // Every other layer-1 signal needs content this product does not have yet:
    // a frequency-ranked pool wide enough to extrapolate over, paradigm-tagged
    // tasks, level-labelled texts, free production. Absent is the honest
    // reading, and it is stated per signal rather than by leaving them out.
    return { id, status: "no-data" as const, value: null, taskCount: 0 };
  });
}

function readSkill(skill: Skill, signals: readonly SignalReading[]): SkillReading {
  const feeding = signalsFeedingSkill(skill);
  const hasData = feeding.some(
    (id) => signals.find((signal) => signal.id === id)?.status === "has-data",
  );

  // "uncertain" is a real status with a band behind it (study/03), and nothing
  // here can produce a band yet — so a skill is measured or it is not. The day
  // a feeding signal arrives, this is where the uncertain case belongs.
  return {
    skill,
    status: hasData ? "measured" : "not-measured",
    feedingSignals: feeding,
  };
}

/**
 * `now` is accepted for the same reason the scheduler takes it — a reading that
 * silently uses the wall clock cannot be tested at a chosen moment. Nothing
 * derived today depends on it; the trend views (study/03 V1) will.
 */
export function readLevel(tasks: readonly Task[], now: number): LevelReading {
  void now;

  const signals = readSignals(tasks);
  const skills = SKILLS.map((skill) => readSkill(skill, signals));
  const counting = countingSkills(skills);

  return {
    skills,
    signals,
    overall:
      counting.length < 2
        ? { status: "withheld", reason: "fewer-than-two-counting-skills" }
        : { status: "level", countedSkills: counting },
  };
}
