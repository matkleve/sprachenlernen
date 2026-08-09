/**
 * The learning context: what is available to the learner right now.
 * Contract: docs/specs/service/method-catalogue.md
 *
 * Separate from the catalogue because it is a different thing that happens to
 * be consumed by it. A context describes a person and a moment; a catalogue
 * entry describes a way of practising. Keeping them in one file made the
 * catalogue module the place where both lived, which is how a "cannot perform"
 * quantity and a "may not perform" quantity end up looking interchangeable
 * (study/26).
 */

export const CONTEXT_DIMENSIONS = {
  eyes: ["free", "occupied"],
  hands: ["free", "one", "none"],
  voice: ["aloud", "quiet", "none"],
  writingSurface: ["paper", "keyboard", "touch", "none"],
  sound: ["speaker", "headphones", "silent"],
  attention: ["full", "divided", "fragmented"],
  company: ["alone", "speakers", "others"],
} as const;

export type Dimension = keyof typeof CONTEXT_DIMENSIONS;

export const TIME_BUDGETS = ["2", "15", "45", "open"] as const;
export type TimeBudget = (typeof TIME_BUDGETS)[number];

export type Context = {
  [K in Dimension]: (typeof CONTEXT_DIMENSIONS)[K][number];
} & { time: TimeBudget };

/**
 * A full context under a name. Presets exist because asking four questions
 * before someone may learn rebuilds the barrier to entry from study/01 S1 —
 * day to day it is one tap on "kitchen", not four answers.
 */
export type Preset = { id: string; name: string; context: Context };

export type PresetsResult = { presets?: Preset[]; errors: string[] };

// --- shared validation helpers ----------------------------------------------

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

export const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value);

export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// --- loading -----------------------------------------------------------------

export const loadPresets = (input: unknown): PresetsResult => {
  const errors: string[] = [];

  if (!isRecord(input) || !Array.isArray(input.presets)) {
    return { errors: ["presets: required array"] };
  }

  const ids = new Set<string>();

  input.presets.forEach((preset, index) => {
    if (!isRecord(preset)) {
      errors.push(`presets[${index}]: must be an object`);
      return;
    }
    if (!isNonEmptyString(preset.id) || !ID_PATTERN.test(preset.id)) {
      errors.push(`presets[${index}].id: required, lowercase kebab-case`);
    } else if (ids.has(preset.id)) {
      errors.push(`presets[${index}].id: "${preset.id}" is already used`);
    } else {
      ids.add(preset.id);
    }
    if (!isNonEmptyString(preset.name)) errors.push(`presets[${index}].name: required`);

    const context = preset.context;
    if (!isRecord(context)) {
      errors.push(`presets[${index}].context: required object`);
      return;
    }
    for (const [dimension, allowed] of Object.entries(CONTEXT_DIMENSIONS)) {
      if (!oneOf(context[dimension], allowed)) {
        errors.push(`presets[${index}].context.${dimension}: one of ${allowed.join(", ")}`);
      }
    }
    if (!oneOf(context.time, TIME_BUDGETS)) {
      errors.push(`presets[${index}].context.time: one of ${TIME_BUDGETS.join(", ")}`);
    }
    // A misspelt dimension would otherwise sit in the file looking applied. A
    // preset is a complete context; there is nothing else it can carry.
    for (const key of Object.keys(context)) {
      if (key !== "time" && !(key in CONTEXT_DIMENSIONS)) {
        errors.push(`presets[${index}].context.${key}: not a context dimension`);
      }
    }
  });

  if (errors.length) return { errors };
  return { presets: input.presets as Preset[], errors: [] };
};
