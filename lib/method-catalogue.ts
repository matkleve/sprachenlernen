/**
 * The method catalogue. Contract: docs/specs/service/method-catalogue.md
 *
 * The load-bearing decision here is that the catalogue is **data, not code**
 * (study/21, "What follows for the product", point 1). Adding a method must be
 * an entry in `data/methods/`, never a release — the alternative was a
 * `switch` over method ids somewhere in the menu, which is exactly how a
 * catalogue stops at ten entries.
 *
 * Two consequences fall out of that and are enforced below rather than
 * documented and hoped for:
 *
 * - **A method with no context requirements cannot be admitted.** It would
 *   match every context and filtering would quietly stop meaning anything.
 * - **A commitment is not a session.** It has no duration, no intensity and no
 *   context, because it runs in the background of a life rather than in a slot
 *   (study/24, S4). Filtering it by "do you have paper" is a category error, so
 *   the type system and the validator both refuse to let it carry one.
 *
 * The context model itself lives in `lib/learning-context.ts` and is re-exported
 * here, so `@/lib/method-catalogue` stays the one import a caller needs.
 */

export {
  CONTEXT_DIMENSIONS,
  TIME_BUDGETS,
  loadPresets,
  type Context,
  type Dimension,
  type Preset,
  type PresetsResult,
  type TimeBudget,
} from "./learning-context";

import {
  CONTEXT_DIMENSIONS,
  ID_PATTERN,
  isNonEmptyString,
  isRecord,
  oneOf,
  type Context,
  type TimeBudget,
} from "./learning-context";

export const SECTIONS = [
  "reading",
  "listening",
  "speaking",
  "writing",
  "form",
  "vocabulary",
  "world",
  "commitments",
] as const;
export type Section = (typeof SECTIONS)[number];

export const SKILLS = ["reading", "listening", "speaking", "writing", "vocabulary"] as const;
export type Skill = (typeof SKILLS)[number];

/** The seven layer-1 signals of study/03. Nothing else is measured. */
export const SIGNALS = [
  "vocabularySize",
  "formMastery",
  "recallStability",
  "lexicalCoverage",
  "responseTime",
  "successByDifficulty",
  "productionQuality",
] as const;
export type Signal = (typeof SIGNALS)[number];

export const EVIDENCE_GRADES = ["A", "B", "C", "D"] as const;
export type EvidenceGrade = (typeof EVIDENCE_GRADES)[number];

/** Which values of a dimension the method can be performed in. */
export type RequirementSet = {
  [K in keyof typeof CONTEXT_DIMENSIONS]?: readonly (typeof CONTEXT_DIMENSIONS)[K][number][];
};

/**
 * One set, or several alternatives of which any one suffices.
 *
 * The array form exists because a single set is AND across dimensions and OR
 * only within one, and chapter 21 states a requirement that shape cannot hold:
 * the SRS session runs on "touch **or** voice". Expressed as one set it loses
 * the voice half, and the only method with a daily floor stops being offerable
 * in four of the seven presets — a floor nobody can act on.
 */
export type Requirements = RequirementSet | readonly RequirementSet[];

// --- entries -----------------------------------------------------------------

/**
 * Cognitive load, not duration — it answers "can I manage this right now?",
 * which is the question most sessions founder on (study/12).
 *
 * Anchored so that the three values mean the same thing across fifty-three
 * entries. Without anchors an authored 1–3 scale is three shades of nothing.
 */
export const INTENSITY = {
  1: "can be done tired or distracted",
  2: "needs attention, but not effort",
  3: "you will be tired afterwards",
} as const;

type EntryCommon = {
  id: string;
  name: string;
  /** The card's subtitle: what you actually do, in one line, no jargon. */
  summary: string;
  section: Section;
  /** Prose, from the catalogue table. Shown on the card; never parsed. */
  trains: string;
  skills: Skill[];
  /** `null` where no layer-1 signal covers what the method trains. */
  targetSignal: Signal | null;
  evidence: EvidenceGrade;
  /** "Avoided by engagement-optimised apps" (study/21), not "difficult for you". */
  demanding: boolean;
  /** Whether the app runs it. Roughly half the catalogue does not. */
  hosted: boolean;
  /** Mandatory. A method with nothing honest to say about its limits is not described. */
  doesNotDo: string;
};

export type MethodEntry = EntryCommon & {
  type: "method";
  intensity: 1 | 2 | 3;
  /** Minutes, ascending. `null` means open-ended: it fits only an open budget. */
  durations: number[] | null;
  requires: Requirements;
  /**
   * Lower bound on how often the method is **offered**, in days. Never a lower
   * bound on what the learner does — see study/12, "The floor".
   */
  offerEveryDays: number | null;
};

export type CommitmentEntry = EntryCommon & {
  type: "commitment";
  /** Days until the one quiet "still doing this?" review. No completion, no streak. */
  reviewAfterDays: number;
};

export type Entry = MethodEntry | CommitmentEntry;

export type Catalogue = { entries: Entry[] };

export type LoadResult = { catalogue?: Catalogue; errors: string[] };

// --- validation --------------------------------------------------------------

const validateRequirementSet = (value: unknown, where: string, errors: string[]) => {
  if (!isRecord(value)) {
    errors.push(`${where}: required object`);
    return;
  }

  if (Object.keys(value).length === 0) {
    // study/21: without requirements it matches everything, and the filter
    // that the whole menu is built on stops separating anything.
    errors.push(`${where}: a method with no context requirements cannot be admitted`);
    return;
  }

  for (const [dimension, allowed] of Object.entries(value)) {
    const values = CONTEXT_DIMENSIONS[dimension as keyof typeof CONTEXT_DIMENSIONS];
    if (values === undefined) {
      errors.push(`${where}.${dimension}: not a context dimension`);
      continue;
    }
    if (!Array.isArray(allowed) || allowed.length === 0) {
      errors.push(`${where}.${dimension}: must be a non-empty array`);
      continue;
    }
    for (const entry of allowed) {
      if (!oneOf(entry, values)) {
        errors.push(
          `${where}.${dimension}: "${String(entry)}" is not one of ${values.join(", ")}`,
        );
      }
    }
  }
};

const validateRequirements = (value: unknown, where: string, errors: string[]) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      errors.push(`${where}.requires: a method with no context requirements cannot be admitted`);
      return;
    }
    value.forEach((set, index) => validateRequirementSet(set, `${where}.requires[${index}]`, errors));
    return;
  }
  validateRequirementSet(value, `${where}.requires`, errors);
};

const validateEntry = (input: unknown, section: Section, index: number, errors: string[]) => {
  const where = `${section}[${index}]`;

  if (!isRecord(input)) {
    errors.push(`${where}: must be an object`);
    return;
  }

  const id = input.id;
  if (!isNonEmptyString(id) || !ID_PATTERN.test(id)) {
    errors.push(`${where}.id: required, lowercase kebab-case`);
  }

  for (const key of ["name", "summary", "trains", "doesNotDo"] as const) {
    if (!isNonEmptyString(input[key])) {
      errors.push(`${where}.${key}: required, must be a non-empty string`);
    }
  }

  if (!oneOf(input.evidence, EVIDENCE_GRADES)) {
    errors.push(`${where}.evidence: required — one of ${EVIDENCE_GRADES.join(", ")}`);
  }

  for (const key of ["demanding", "hosted"] as const) {
    if (typeof input[key] !== "boolean") errors.push(`${where}.${key}: required boolean`);
  }

  if (!Array.isArray(input.skills) || input.skills.some((s) => !oneOf(s, SKILLS))) {
    errors.push(`${where}.skills: required array of ${SKILLS.join(", ")}`);
  }

  if (input.targetSignal !== null && !oneOf(input.targetSignal, SIGNALS)) {
    errors.push(`${where}.targetSignal: required — null or one of ${SIGNALS.join(", ")}`);
  }

  if (input.type === "method") {
    if (![1, 2, 3].includes(input.intensity as number)) {
      errors.push(`${where}.intensity: required — 1, 2 or 3`);
    }

    const durations = input.durations;
    if (durations !== null) {
      if (!Array.isArray(durations) || durations.length === 0) {
        errors.push(`${where}.durations: null or a non-empty array of minutes`);
      } else if (
        durations.some((d) => typeof d !== "number" || !Number.isFinite(d) || d <= 0) ||
        durations.some((d, i) => i > 0 && (d as number) <= (durations[i - 1] as number))
      ) {
        errors.push(`${where}.durations: minutes must be positive and ascending`);
      }
    }

    validateRequirements(input.requires, where, errors);

    const floor = input.offerEveryDays;
    if (floor !== null && (typeof floor !== "number" || !Number.isFinite(floor) || floor <= 0)) {
      errors.push(`${where}.offerEveryDays: null or a positive number of days`);
    }

    if (input.reviewAfterDays !== undefined) {
      errors.push(`${where}.reviewAfterDays: a method is not reviewed, it is completed`);
    }
  } else if (input.type === "commitment") {
    for (const key of ["intensity", "durations", "offerEveryDays"] as const) {
      if (input[key] !== null) errors.push(`${where}.${key}: must be null on a commitment`);
    }
    if (isRecord(input.requires) && Object.keys(input.requires).length > 0) {
      errors.push(`${where}.requires: a commitment has no context — it is not a session`);
    }
    const review = input.reviewAfterDays;
    if (typeof review !== "number" || !Number.isFinite(review) || review <= 0) {
      errors.push(`${where}.reviewAfterDays: required, a positive number of days`);
    }
  } else {
    errors.push(`${where}.type: required — "method" or "commitment"`);
  }
};

/**
 * Validates and loads the section files. Every file is checked even when an
 * earlier one failed: a caller fixing the data wants the whole list, not the
 * first line of it.
 */
export const loadCatalogue = (inputs: readonly unknown[]): LoadResult => {
  const errors: string[] = [];
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const sectionsSeen = new Set<string>();

  inputs.forEach((input, fileIndex) => {
    if (!isRecord(input)) {
      errors.push(`file ${fileIndex}: must be an object`);
      return;
    }

    const section = input.section;
    if (!oneOf(section, SECTIONS)) {
      errors.push(`file ${fileIndex}: section must be one of ${SECTIONS.join(", ")}`);
      return;
    }

    if (sectionsSeen.has(section)) {
      errors.push(`file ${fileIndex}: section "${section}" is already declared`);
      return;
    }
    sectionsSeen.add(section);

    if (!Array.isArray(input.entries)) {
      errors.push(`${section}: entries must be an array`);
      return;
    }

    input.entries.forEach((entry, index) => {
      const before = errors.length;
      validateEntry(entry, section, index, errors);
      if (errors.length !== before) return;

      const id = (entry as { id: string }).id;
      if (seen.has(id)) {
        errors.push(`${section}[${index}].id: "${id}" is already used`);
        return;
      }
      seen.add(id);
      entries.push({ ...(entry as object), section } as Entry);
    });
  });

  if (errors.length) return { errors };
  return { catalogue: { entries }, errors: [] };
};

// --- filtering ---------------------------------------------------------------

const BUDGET_MINUTES: Record<TimeBudget, number> = {
  "2": 2,
  "15": 15,
  "45": 45,
  open: Number.POSITIVE_INFINITY,
};

export const isMethod = (entry: Entry): entry is MethodEntry => entry.type === "method";
export const isCommitment = (entry: Entry): entry is CommitmentEntry =>
  entry.type === "commitment";

/** Whether the shortest variant fits within this many minutes. */
export const fitsMinutes = (entry: MethodEntry, minutes: number): boolean =>
  entry.durations === null ? minutes >= 45 : Math.min(...entry.durations) <= minutes;

/** Whether the shortest variant of the method fits the budget. */
export const fitsTime = (entry: MethodEntry, time: TimeBudget): boolean =>
  entry.durations === null
    ? time === "open"
    : Math.min(...entry.durations) <= BUDGET_MINUTES[time];

/**
 * Context is a **hard** filter: a method that cannot be performed right now has
 * an effect of zero and does not belong in the menu, not even greyed out
 * (study/21). Readiness is a different quantity and is not applied here — it
 * demotes and annotates, and doing both in one pass is how a "cannot" becomes a
 * "may not" (study/26).
 */
export const matchesContext = (entry: MethodEntry, context: Context): boolean => {
  if (!fitsTime(entry, context.time)) return false;

  const sets = Array.isArray(entry.requires) ? entry.requires : [entry.requires as RequirementSet];

  return sets.some((set) =>
    Object.entries(set).every(([dimension, allowed]) =>
      (allowed as readonly string[]).includes(
        context[dimension as keyof typeof CONTEXT_DIMENSIONS],
      ),
    ),
  );
};

/**
 * Commitments are absent from the result by construction, not by omission:
 * they are standing rules rather than sessions, so "does it fit this context"
 * has no answer for them. Reach them with `commitments()`.
 */
export const filterByContext = (catalogue: Catalogue, context: Context): MethodEntry[] =>
  catalogue.entries.filter(isMethod).filter((entry) => matchesContext(entry, context));

/**
 * Whether a method can be done when only some context dimensions are fixed.
 * Used by the menu's optional "refine" filters — not the primary path.
 */
export const fitsPartialContext = (
  entry: MethodEntry,
  partial: Partial<Context>,
): boolean => {
  const sets = Array.isArray(entry.requires)
    ? entry.requires
    : [entry.requires as RequirementSet];

  return sets.some((set) =>
    Object.entries(set).every(([dimension, allowed]) => {
      const key = dimension as keyof typeof CONTEXT_DIMENSIONS;
      const chosen = partial[key];
      if (chosen === undefined) return true;
      return (allowed as readonly string[]).includes(chosen);
    }),
  );
};

export const commitments = (catalogue: Catalogue): CommitmentEntry[] =>
  catalogue.entries.filter(isCommitment);

export const bySkill = (catalogue: Catalogue, skill: Skill): Entry[] =>
  catalogue.entries.filter((entry) => entry.skills.includes(skill));

export const byId = (catalogue: Catalogue, id: string): Entry | undefined =>
  catalogue.entries.find((entry) => entry.id === id);
