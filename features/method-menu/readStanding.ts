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
  // "No language" is passed through rather than folded into omit: the page has
  // to route on it, and a page cannot route on a line it was told to leave out.
  if (outcome.status === "no-language") return { status: "no-language" };
  // A failed read never blocks the catalogue — the standing is the optional part.
  if (outcome.status !== "ok") return { status: "omit" };

  return { status: "ok", summary: standingFromReading(outcome.reading) };
}
