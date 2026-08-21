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
  methodRequiresSound,
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

export type RefineDimension = "eyes" | "hands" | "voice";

export type MenuFilter = {
  timeBudget?: TimeBudget;
  skills?: Skill[];
  energies?: Energy[];
  refine: Partial<Record<RefineDimension, string[]>>;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const SKILL_LABELS: Record<Skill, string> = {
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
  vocabulary: "Vocabulary",
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

const REFINE_KEYS = ["eyes", "hands", "voice"] as const satisfies readonly RefineDimension[];

const parseMultiParam = <T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] | undefined => {
  const raw = first(value);
  if (!raw) return undefined;

  const parsed = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is T => oneOf(part, allowed));

  return parsed.length > 0 ? parsed : undefined;
};

export const serializeMultiParam = (values: readonly string[] | undefined): string | undefined =>
  values && values.length > 0 ? values.join(",") : undefined;

/** Toggle one value in a multi-select set; empty set clears the dimension. */
export const toggleMultiParam = <T extends string>(
  current: readonly T[] | undefined,
  value: T,
): T[] | undefined => {
  const next = new Set(current ?? []);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next.size > 0 ? [...next] : undefined;
};

export const parseMenuFilter = (params: SearchParams): MenuFilter => {
  const timeBudget = parseTimeBudgetParam(first(params.minutes));

  const skills = parseMultiParam(first(params.skill), SKILLS);
  const energies = parseMultiParam(first(params.energy), ["low", "medium", "high"] as const);

  const refine: MenuFilter["refine"] = {};
  for (const key of REFINE_KEYS) {
    const allowed = CONTEXT_DIMENSIONS[key];
    const values = parseMultiParam(first(params[key]), allowed);
    if (values) refine[key] = values;
  }

  return { timeBudget, skills, energies, refine };
};

/** Budget used when the URL omits minutes — matches the slider's default step. */
export const defaultTimeBudget = (): TimeBudget => DEFAULT_TIME_BUDGET;

export type FilterMethodsOptions = {
  /** UC-077 — hide methods that need speaker/headphones. */
  deferListening?: boolean;
};

const fitsRefineSelections = (method: MethodEntry, refine: MenuFilter["refine"]): boolean =>
  (Object.entries(refine) as [RefineDimension, string[]][]).every(([dimension, values]) => {
    if (!values?.length) return true;
    return values.some((value) =>
      fitsPartialContext(method, { [dimension]: value } as Partial<Context>),
    );
  });

export const filterMethods = (
  catalogue: Catalogue,
  filter: MenuFilter,
  options?: FilterMethodsOptions,
): MethodEntry[] => {
  let methods = catalogue.entries.filter(isMethod);

  if (filter.timeBudget !== undefined && !isEndless(filter.timeBudget)) {
    const minutes = filter.timeBudget;
    methods = methods.filter((method) => fitsMinutes(method, minutes));
  }

  if (filter.skills?.length) {
    methods = methods.filter((method) =>
      filter.skills!.some((skill) => method.skills.includes(skill)),
    );
  }

  if (filter.energies?.length) {
    methods = methods.filter((method) =>
      filter.energies!.some((energy) => method.intensity <= ENERGY_TO_MAX_INTENSITY[energy]),
    );
  }

  if (Object.keys(filter.refine).length > 0) {
    methods = methods.filter((method) => fitsRefineSelections(method, filter.refine));
  }

  if (options?.deferListening) {
    methods = methods.filter((method) => !methodRequiresSound(method));
  }

  return methods;
};

export const METHODS_PATH = "/methods";

const PARAM_KEYS = ["minutes", "skill", "energy", ...REFINE_KEYS] as const;
const DETAIL_PARAM_KEYS = [...PARAM_KEYS, "variantMinutes"] as const;

/** Merge filter updates into search params without navigation — for client-side filtering. */
export const applySearchParamUpdates = (
  current: SearchParams,
  updates: Record<string, string | undefined>,
): SearchParams => {
  const next: Record<string, string | undefined> = {};

  for (const key of DETAIL_PARAM_KEYS) {
    const value = first(current[key]);
    if (value) next[key] = value;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }

  return next;
};

export const menuQueryString = (
  params: SearchParams,
  options?: { includeVariantMinutes?: boolean },
): string => {
  const keys = options?.includeVariantMinutes ? DETAIL_PARAM_KEYS : PARAM_KEYS;
  const parts: string[] = [];
  for (const key of keys) {
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
