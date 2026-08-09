/**
 * URL-driven filter for /methods. Contract: docs/specs/page/method-menu.md
 *
 * The page is a Server Component — every filter change is a navigation, so the
 * list and the chosen chips cannot drift apart.
 */

import {
  CONTEXT_DIMENSIONS,
  TIME_BUDGETS,
  filterByContext,
  fitsTime,
  isMethod,
  type Catalogue,
  type Context,
  type MethodEntry,
  type Preset,
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

export const filterMethods = (catalogue: Catalogue, filter: MenuFilter): MethodEntry[] => {
  const all = catalogue.entries.filter(isMethod);

  switch (filter.kind) {
    case "all":
    case "unknown-context":
    case "incomplete-custom":
      return all;
    case "time-only":
      return all.filter((method) => fitsTime(method, filter.time));
    case "filtered":
      return filterByContext(catalogue, filter.context);
  }
};

/** Serialize active filter params for appending to method detail back-links. */
export const menuQueryString = (params: SearchParams): string => {
  const keys = ["context", "time", ...DIMENSION_KEYS];
  const parts: string[] = [];

  for (const key of keys) {
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

  for (const key of ["context", "time", ...DIMENSION_KEYS]) {
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

/** The time budget that is active for highlighting chips, if any. */
export const activeTimeBudget = (filter: MenuFilter): TimeBudget | undefined => {
  if (filter.kind === "time-only") return filter.time;
  if (filter.kind === "filtered") return filter.context.time;
  return undefined;
};
