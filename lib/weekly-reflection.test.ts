import { describe, expect, it } from "vitest";

import { buildWeeklyReflection, isoWeekId, startOfIsoWeek } from "@/lib/weekly-reflection";
import { englishWeeklyReflectionCopy } from "@/lib/weekly-reflection.test-copy";
import type { Grade } from "@/lib/scheduler";

/**
 * Contract: docs/specs/feature/weekly-reflection.md
 */

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 13, 12); // Thursday 2026-08-13
const weekStart = startOfIsoWeek(now);

const cards = [
  {
    taskId: "es:hola:meaning-recall",
    wordId: "es:hola",
    lemma: "hola",
    frequencyRank: 1,
    front: "hola",
    back: "hello",
    descriptionKey: "card.es:hola.meaning-recall.back",
  },
  {
    taskId: "es:adios:meaning-recall",
    wordId: "es:adios",
    lemma: "adiós",
    frequencyRank: 2,
    front: "adiós",
    back: "bye",
    descriptionKey: "card.es:adios.meaning-recall.back",
  },
] as const;

function review(taskId: string, grade: Grade, at: number) {
  return { taskId, reviewedAtMs: at, grade };
}

function baseInput(overrides: Partial<Parameters<typeof buildWeeklyReflection>[0]> = {}) {
  return {
    now,
    languageCode: "es",
    languageName: "Español",
    cards,
    reviews: [] as const,
    seenValue: undefined,
    copy: englishWeeklyReflectionCopy,
    ...overrides,
  };
}

describe("buildWeeklyReflection", () => {
  it("hides the row when there is no review history", () => {
    const result = buildWeeklyReflection(baseInput());

    expect(result.status).toBe("hidden");
  });

  it("returns a single idle card when history exists but not this week", () => {
    const result = buildWeeklyReflection(
      baseInput({
        reviews: [review("es:hola:meaning-recall", "good", weekStart - 10 * DAY)],
      }),
    );

    if (result.status === "hidden") throw new Error("expected visible reflection");
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]?.id).toBe("idle-week");
    expect(result.cards[0]?.headline).toMatch(/did not review/i);
    expect(result.cards[0]?.headline).not.toMatch(/moved from shaky/i);
  });

  it("names a specific movement count when words graduate this week", () => {
    const reviews = [
      review("es:hola:meaning-recall", "good", weekStart - 30 * DAY),
      review("es:hola:meaning-recall", "again", weekStart - 2 * DAY),
      review("es:hola:meaning-recall", "good", weekStart + DAY),
      review("es:hola:meaning-recall", "good", weekStart + 5 * DAY),
      review("es:hola:meaning-recall", "easy", weekStart + 9 * DAY),
    ];

    const result = buildWeeklyReflection(
      baseInput({
        reviews,
      }),
    );

    if (result.status === "hidden") throw new Error("expected visible reflection");
    expect(result.teaser).toMatch(/1 word moved/i);
    expect(result.cards[0]?.id).toBe("movement");
    expect(result.cards[0]?.headline).toMatch(/1 word moved from shaky to held/i);
    expect(result.cards.length).toBeGreaterThanOrEqual(1);
    expect(result.cards.length).toBeLessThanOrEqual(5);
  });

  it("marks the reflection read when the seen cookie matches this week", () => {
    const reviews = [review("es:hola:meaning-recall", "good", weekStart + DAY)];

    const result = buildWeeklyReflection(
      baseInput({
        reviews,
        seenValue: `${isoWeekId(now)}:es`,
      }),
    );

    if (result.status === "hidden") throw new Error("expected visible reflection");
    expect(result.unread).toBe(false);
    expect(result.status).toBe("read");
  });
});
