/**
 * Menu time filter vs detail duration packages.
 * Contract: docs/specs/service/method-session-budget.md
 */
import type { MethodEntry } from "@/lib/method-catalogue";
import { isEndless, parseTimeBudgetParam } from "@/lib/time-scale";

const CARD_ENGINE_METHOD_ID = "srs-session";

export type MenuTimeFilter = number | "endless" | undefined;

export function parseMenuTimeFilter(rawMinutes?: string): MenuTimeFilter {
  if (!rawMinutes) return undefined;
  const parsed = parseTimeBudgetParam(rawMinutes);
  if (parsed === undefined) return undefined;
  if (isEndless(parsed)) return "endless";
  return parsed;
}

export function availableVariantMinutes(
  durations: MethodEntry["durations"],
  menuFilter: MenuTimeFilter,
): number[] {
  if (durations === null || durations.length === 0) return [];
  if (menuFilter === undefined || menuFilter === "endless") return [...durations];
  return durations.filter((minutes) => minutes <= menuFilter);
}

export function resolveDefaultVariantMinutes(
  durations: MethodEntry["durations"],
  menuFilterRaw?: string,
): number | undefined {
  const available = availableVariantMinutes(durations, parseMenuTimeFilter(menuFilterRaw));
  if (available.length === 0) return undefined;
  return Math.max(...available);
}

export function resolveVariantMinutes(
  durations: MethodEntry["durations"],
  options?: { menuFilterRaw?: string; selectedVariantRaw?: string; methodId?: string },
): number | undefined {
  if (options?.methodId === CARD_ENGINE_METHOD_ID) return undefined;

  const available = availableVariantMinutes(durations, parseMenuTimeFilter(options?.menuFilterRaw));
  if (available.length === 0) return undefined;

  const selectedRaw = options?.selectedVariantRaw;
  if (selectedRaw) {
    const selected = Number(selectedRaw);
    if (Number.isFinite(selected) && available.includes(selected)) {
      return selected;
    }
  }

  return Math.max(...available);
}

/** @deprecated Use resolveVariantMinutes — kept for call sites migrating to filter-only menu. */
export function resolveSessionBudgetMinutes(
  durations: MethodEntry["durations"],
  rawMinutes?: string,
): number | undefined {
  return resolveVariantMinutes(durations, { menuFilterRaw: rawMinutes, selectedVariantRaw: rawMinutes });
}

export function appendVariantMinutesParam(
  params: URLSearchParams,
  variantMinutes: number | undefined,
): void {
  if (variantMinutes !== undefined) {
    params.set("minutes", String(variantMinutes));
  }
}

/** @deprecated Use appendVariantMinutesParam */
export const appendBudgetMinutesParam = appendVariantMinutesParam;

export function showDurationVariantPicker(
  durations: MethodEntry["durations"],
  methodId: string,
): boolean {
  if (methodId === CARD_ENGINE_METHOD_ID) return false;
  return durations !== null && durations.length > 1;
}
