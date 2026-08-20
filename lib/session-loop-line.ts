/**
 * K4 session-complete loop line. Contract:
 * docs/specs/feature/content-traceability.md (behaviour row 4)
 */
import {
  computeCoverage,
  sourceText,
  type Source,
} from "@/lib/coverage";
import type { Lexicon } from "@/lib/lexicon";
import { routes } from "@/lib/routes";
import type { Task } from "@/lib/scheduler";

/** Passed to the client at session start — held set + meaning tasks for in-session replay. */
export type SessionLoopContext = {
  heldLemmasAtStart: readonly string[];
  meaningTasksByTaskId: Readonly<Record<string, Task>>;
};

export type SessionLoopLineView = {
  heldCount: number;
  href: string;
};

export type BuildSessionLoopLineInput = {
  sources: readonly Source[];
  lexicon: Lexicon;
  heldLemmasBefore: ReadonlySet<string>;
  newlyHeldLemmas: readonly string[];
};

const persistedSources = (sources: readonly Source[]): Source[] =>
  sources.filter((source) => !source.ephemeral);

export function buildSessionLoopLine(
  input: BuildSessionLoopLineInput,
): SessionLoopLineView | null {
  const { lexicon, heldLemmasBefore, newlyHeldLemmas } = input;
  if (newlyHeldLemmas.length === 0) return null;

  const saved = persistedSources(input.sources);
  if (saved.length === 0) return null;

  const heldAfter = new Set(heldLemmasBefore);
  for (const lemma of newlyHeldLemmas) heldAfter.add(lemma);

  const deltas: { sourceId: string; delta: number; after: number }[] = [];
  for (const source of saved) {
    const text = sourceText(source);
    const before = computeCoverage(text, lexicon, heldLemmasBefore).coveragePercent;
    const after = computeCoverage(text, lexicon, heldAfter).coveragePercent;
    if (before !== after) {
      deltas.push({ sourceId: source.id, delta: after - before, after });
    }
  }

  if (deltas.length === 0) return null;

  deltas.sort((a, b) => b.delta - a.delta || b.after - a.after);
  const top = deltas[0]!;

  return {
    heldCount: newlyHeldLemmas.length,
    href: deltas.length === 1 ? routes.contentDetail(top.sourceId) : routes.content,
  };
}
