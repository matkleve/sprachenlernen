import { readProgress } from "@/features/progress/reading";

import { standingFromReading, type StandingOutcome } from "./standing";

/**
 * Loads current standing for `/methods`. Contract:
 * docs/specs/page/method-menu.md § Current standing.
 *
 * Omits on read failure so a broken progress load never blocks the catalogue.
 */
export async function readStanding(now: number = Date.now()): Promise<StandingOutcome> {
  const outcome = await readProgress(now);
  if (outcome.status === "error") return { status: "omit" };

  return { status: "ok", summary: standingFromReading(outcome.reading) };
}
