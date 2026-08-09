/**
 * URL-driven filter for /methods. Contract: docs/specs/page/method-menu.md
 */

import {
  CONTEXT_DIMENSIONS,
  SKILLS,
  TIME_BUDGETS,
  filterByContext,
  fitsTime,
  isMethod,
  type Catalogue,
  type Context,
  type MethodEntry,
  type Preset,
  type Skill,
  type TimeBudget,
} from "@/lib/method-catalogue";
import { oneOf } from "@/lib/learning-context";

export type MenuFilter =
  | { kind: "all" }
  | { kind: "unknown-context"; contextId: string }
  | { kind: "incomplete-custom"; partial: Partial<Context> }
  | { kind: "time-only"; time: TimeBudget }
  | { kind: "filtered"; context: Context; presetId?: string };

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const DIMENSION_KEYS = Object.keys(CONTEXT_DIMENSIONS) as (keyof typeof CONTEXT_DIMENSIONS)[];

export const TIME_BUDGET_LABELS: Record<TimeBudget, string> = {
  "2": "2 min",
  "15": "15 min",
  "45": "45 min",
  open: "Open-ended",
};

export const SKILL_LABELS: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
};

export const parseSkill = (params: SearchParams): Skill | undefined => {
  const skill = first(params.skill);
  return skill && oneOf(skill, SKILLS) ? skill : undefined;
};

/** Parse `?context=` and dimension params into a filter state. */
export const parseMenuFilter = (params: SearchParams, presets: Preset[]): MenuFilter => {
  const contextId = first(params.context);
  const timeOverride = first(params.time);

  if (contextId) {
    const preset = presets.find((entry) => entry.id === contextId);
    if (!preset) return { kind: "unknown-context", contextId };

    const context: Context = {
      ...preset.context,
      ...(timeOverride && oneOf(timeOverride, TIME_BUDGETS)
        ? { time: timeOverride as TimeBudget }
        : {}),
    };
    return { kind: "filtered", context, presetId: preset.id };
  }

  const partial: Partial<Context> = {};

  for (const dimension of DIMENSION_KEYS) {
    const value = first(params[dimension]);
    if (value && oneOf(value, CONTEXT_DIMENSIONS[dimension])) {
      Object.assign(partial, { [dimension]: value });
    }
  }

  const time = first(params.time);
  if (time && oneOf(time, TIME_BUDGETS)) {
    partial.time = time as TimeBudget;
  }

  const hasDimension = DIMENSION_KEYS.some((dimension) => partial[dimension] !== undefined);
  const hasTime = partial.time !== undefined;

  if (!hasDimension && !hasTime) return { kind: "all" };

  if (!hasDimension && hasTime) {
    return { kind: "time-only", time: partial.time! };
  }

  const complete =
    DIMENSION_KEYS.every((dimension) => partial[dimension] !== undefined) && hasTime;

  if (complete) {
    return { kind: "filtered", context: partial as Context };
  }

  return { kind: "incomplete-custom", partial };
};

const applySkill = (methods: MethodEntry[], skill: Skill | undefined): MethodEntry[] =>
  skill ? methods.filter((method) => method.skills.includes(skill)) : methods;

export const filterMethods = (
  catalogue: Catalogue,
  filter: MenuFilter,
  skill?: Skill,
): MethodEntry[] => {
  const all = catalogue.entries.filter(isMethod);
  let methods: MethodEntry[];

  switch (filter.kind) {
    case "all":
    case "unknown-context":
    case "incomplete-custom":
      methods = all;
      break;
    case "time-only":
      methods = all.filter((method) => fitsTime(method, filter.time));
      break;
    case "filtered":
      methods = filterByContext(catalogue, filter.context);
      break;
  }

  return applySkill(methods, skill);
};

const PARAM_KEYS = ["context", "skill", "time", ...DIMENSION_KEYS] as const;

/** Serialize active filter params for back-links and card query preservation. */
export const menuQueryString = (params: SearchParams): string => {
  const parts: string[] = [];

  for (const key of PARAM_KEYS) {
    const value = first(params[key]);
    if (value) parts.push(`${key}=${encodeURIComponent(value)}`);
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
};

/** Build a /methods href, merging updates onto current params. */
export const buildMethodsHref = (
  current: SearchParams,
  updates: Record<string, string | undefined>,
): string => {
  const next: Record<string, string | undefined> = {};

  for (const key of PARAM_KEYS) {
    const value = first(current[key]);
    if (value) next[key] = value;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }

  if (updates.context !== undefined) {
    for (const dimension of DIMENSION_KEYS) delete next[dimension];
  }
  if (DIMENSION_KEYS.some((dimension) => updates[dimension] !== undefined)) {
    delete next.context;
  }

  const query = Object.entries(next)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
    .join("&");

  return query ? `/methods?${query}` : "/methods";
};

/** Build query params from a full context (for saved presets). */
export const contextToSearchParams = (context: Context): Record<string, string> => {
  const params: Record<string, string> = { time: context.time };
  for (const dimension of DIMENSION_KEYS) {
    params[dimension] = context[dimension];
  }
  return params;
};

export const activeTimeBudget = (filter: MenuFilter): TimeBudget | undefined => {
  if (filter.kind === "time-only") return filter.time;
  if (filter.kind === "filtered") return filter.context.time;
  return undefined;
};

/** A complete custom context suitable for saving, if one is active. */
export const savableCustomContext = (filter: MenuFilter): Context | undefined => {
  if (filter.kind === "filtered" && !filter.presetId) return filter.context;
  return undefined;
};
