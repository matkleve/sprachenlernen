/**
 * Contract: docs/specs/service/form-practice.md (session composition rule 4)
 */
import { describe, expect, it } from "vitest";

import { mixFormSession, paradigmMixingKey } from "@/lib/form-session-mixing";
import { buildFormSessionWithPullForward } from "@/lib/form-pull-forward";
import type { StarterCard } from "@/lib/starter-deck";
import { newTask } from "@/lib/scheduler";

function card(lemma: string, cell: string, rank: number, dueOffsetDays: number, now: number): StarterCard {
  return {
    taskId: `es:${lemma}:surface:form-recall`,
    wordId: `es:${lemma}`,
    lemma,
    front: "gloss",
    descriptionKey: "gloss.key",
    back: "surface",
    frequencyRank: rank,
    paradigmCell: cell,
  };
}

const lemmaMeta = {
  hablar: { verb: "1" },
  comer: { verb: "2" },
};

function satisfiesMixingRules(cards: readonly StarterCard[]): boolean {
  for (let index = 1; index < cards.length; index += 1) {
    if (cards[index]!.lemma === cards[index - 1]!.lemma) return false;
  }
  for (let start = 0; start <= cards.length - 4; start += 1) {
    const window = cards.slice(start, start + 4);
    const counts = new Map<string, number>();
    for (const entry of window) {
      const key = paradigmMixingKey(entry.lemma, entry.paradigmCell ?? "", lemmaMeta);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (Math.max(...counts.values(), 0) > 2) return false;
  }
  return true;
}

describe("form-pull-forward", () => {
  it("pulls non-due cards forward when the due set alone cannot mix cleanly", () => {
    const now = Date.parse("2026-08-20T12:00:00.000Z");
    const dueCards = [
      card("hablar", "ind.pres.1sg", 1, -1, now),
      card("hablar", "ind.pres.3sg", 2, -1, now),
    ];
    const nonDue = [
      card("comer", "ind.pres.1sg", 3, 5, now),
      card("comer", "ind.pres.3sg", 4, 5, now),
    ];

    const mixedOnlyDue = mixFormSession(dueCards, { lemmaMeta });
    expect(satisfiesMixingRules(mixedOnlyDue)).toBe(false);

    const tasksByTaskId = Object.fromEntries(
      [...dueCards, ...nonDue].map((entry) => [
        entry.taskId,
        newTask(entry.taskId, entry.wordId),
      ]),
    );
    tasksByTaskId[dueCards[0]!.taskId] = {
      ...tasksByTaskId[dueCards[0]!.taskId]!,
      due: now - 86_400_000,
    };
    tasksByTaskId[dueCards[1]!.taskId] = {
      ...tasksByTaskId[dueCards[1]!.taskId]!,
      due: now - 86_400_000,
    };

    const session = buildFormSessionWithPullForward({
      dueCards,
      reserveCards: nonDue,
      sessionLength: 4,
      lemmaMeta,
      tasksByTaskId,
      now,
    });

    expect(session.length).toBe(4);
    expect(satisfiesMixingRules(session)).toBe(true);
    expect(session.some((entry) => entry.lemma === "comer")).toBe(true);
  });
});
