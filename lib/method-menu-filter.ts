/**
 * URL-driven filter for /methods. Contract: docs/specs/page/method-menu.md
 *
 * Three primary questions (time, skill, energy) narrow the catalogue; optional
 * refine constraints live in a details panel. No "where are you" presets.
 */

import {
  CONTEXT_DIMENSIONS,
  SKILLS,
  fitsMinutes,
  fitsPartialContext,
  isMethod,
  type Catalogue,
  type Context,
  type MethodEntry,
  type Skill,
} from "@/lib/method-catalogue";
import { oneOf } from "@/lib/learning-context";
import {
  DEFAULT_TIME_BUDGET,
  isEndless,
  parseTimeBudgetParam,
  type TimeBudget,
} from "@/lib/time-scale";

export type { TimeBudget };

export type Energy = "low" | "medium" | "high";

export type MenuFilter = {
  timeBudget?: TimeBudget;
  skill?: Skill;
  energy?: Energy;
  refine: Partial<Pick<Context, "eyes" | "hands" | "voice">>;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const SKILL_LABELS: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
};

export const ENERGY_LABELS: Record<Energy, string> = {
  low: "Tired or distracted",
  medium: "Normal focus",
  high: "Full effort",
};

const ENERGY_TO_MAX_INTENSITY: Record<Energy, 1 | 2 | 3> = {
  low: 1,
  medium: 2,
  high: 3,
};

const REFINE_KEYS = ["eyes", "hands", "voice"] as const;

export const parseMenuFilter = (params: SearchParams): MenuFilter => {
  const timeBudget = parseTimeBudgetParam(first(params.minutes));

  const skill = first(params.skill);
  const parsedSkill = skill && oneOf(skill, SKILLS) ? skill : undefined;

  const energy = first(params.energy);
  const parsedEnergy =
    energy && oneOf(energy, ["low", "medium", "high"] as const) ? energy : undefined;

  const refine: MenuFilter["refine"] = {};
  for (const key of REFINE_KEYS) {
    const value = first(params[key]);
    const allowed = CONTEXT_DIMENSIONS[key];
    if (value && oneOf(value, allowed)) {
      Object.assign(refine, { [key]: value });
    }
  }

  return { timeBudget, skill: parsedSkill, energy: parsedEnergy, refine };
};

/** Budget used when the URL omits minutes — matches the slider's default step. */
export const defaultTimeBudget = (): TimeBudget => DEFAULT_TIME_BUDGET;

export const filterMethods = (catalogue: Catalogue, filter: MenuFilter): MethodEntry[] => {
  let methods = catalogue.entries.filter(isMethod);

  if (filter.timeBudget !== undefined && !isEndless(filter.timeBudget)) {
    const minutes = filter.timeBudget;
    methods = methods.filter((method) => fitsMinutes(method, minutes));
  }

  if (filter.skill !== undefined) {
    methods = methods.filter((method) => method.skills.includes(filter.skill!));
  }

  if (filter.energy !== undefined) {
    const max = ENERGY_TO_MAX_INTENSITY[filter.energy];
    methods = methods.filter((method) => method.intensity <= max);
  }

  if (Object.keys(filter.refine).length > 0) {
    methods = methods.filter((method) => fitsPartialContext(method, filter.refine));
  }

  return methods;
};

export const METHODS_PATH = "/methods";

const PARAM_KEYS = ["minutes", "skill", "energy", ...REFINE_KEYS] as const;

/** Merge filter updates into search params without navigation — for client-side filtering. */
export const applySearchParamUpdates = (
  current: SearchParams,
  updates: Record<string, string | undefined>,
): SearchParams => {
  const next: Record<string, string | undefined> = {};

  for (const key of PARAM_KEYS) {
    const value = first(current[key]);
    if (value) next[key] = value;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }

  return next;
};

export const menuQueryString = (params: SearchParams): string => {
  const parts: string[] = [];
  for (const key of PARAM_KEYS) {
    const value = first(params[key]);
    if (value) parts.push(`${key}=${encodeURIComponent(value)}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
};

export const buildMethodsHref = (
  current: SearchParams,
  updates: Record<string, string | undefined>,
): string => {
  const next = applySearchParamUpdates(current, updates);

  const query = Object.entries(next)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `${METHODS_PATH}?${query}` : METHODS_PATH;
};
