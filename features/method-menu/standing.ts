import type { LevelReading } from "@/lib/level-model";

/**
 * One-line standing for the method menu. Contract:
 * docs/specs/page/method-menu.md § Current standing.
 */

export type StandingSummary =
  | { kind: "empty" }
  | { kind: "recorded"; held: number; poolSize: number };

export type StandingOutcome =
  | { status: "ok"; summary: StandingSummary }
  /** Signed in, nothing chosen — the page routes to the picker. */
  | { status: "no-language" }
  | { status: "omit" };

export function standingFromReading(reading: LevelReading): StandingSummary {
  const vocabulary = reading.signals.find((signal) => signal.id === "vocabulary-size");
  const hasAnyData = reading.signals.some((signal) => signal.status === "has-data");

  if (!hasAnyData || vocabulary?.status !== "has-data" || vocabulary.value === null) {
    return { kind: "empty" };
  }

  return {
    kind: "recorded",
    held: vocabulary.value,
    poolSize: vocabulary.taskCount,
  };
}
