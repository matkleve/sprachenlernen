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

/** All catalogue packages — shown on detail; not narrowed by menu time filter. */
export function catalogueVariantMinutes(durations: MethodEntry["durations"]): number[] {
  if (durations === null || durations.length === 0) return [];
  return [...durations];
}

/** @deprecated Use catalogueVariantMinutes — menu filter does not hide detail chips. */
export function availableVariantMinutes(
  durations: MethodEntry["durations"],
  _menuFilter?: MenuTimeFilter,
): number[] {
  return catalogueVariantMinutes(durations);
}

export function resolveDefaultVariantMinutes(
  durations: MethodEntry["durations"],
): number | undefined {
  const packages = catalogueVariantMinutes(durations);
  if (packages.length === 0) return undefined;
  return Math.max(...packages);
}

export function resolveVariantMinutes(
  durations: MethodEntry["durations"],
  options?: { selectedVariantRaw?: string; methodId?: string },
): number | undefined {
  if (options?.methodId === CARD_ENGINE_METHOD_ID) return undefined;

  const packages = catalogueVariantMinutes(durations);
  if (packages.length === 0) return undefined;

  const selectedRaw = options?.selectedVariantRaw;
  if (selectedRaw) {
    const selected = Number(selectedRaw);
    if (Number.isFinite(selected) && packages.includes(selected)) {
      return selected;
    }
  }

  return Math.max(...packages);
}

/** @deprecated Use resolveVariantMinutes — kept for call sites migrating to filter-only menu. */
export function resolveSessionBudgetMinutes(
  durations: MethodEntry["durations"],
  rawMinutes?: string,
): number | undefined {
  return resolveVariantMinutes(durations, { selectedVariantRaw: rawMinutes });
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
