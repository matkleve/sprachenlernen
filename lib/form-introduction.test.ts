/**
 * Contract: docs/specs/service/form-practice.md (introduction §)
 */
import { describe, expect, it } from "vitest";

import {
  cellIntroductionSortKey,
  countNewCellIntroductionsToday,
  effectiveNewCellBudget,
  filterNewCellCandidates,
  isSubjunctiveCell,
  newCellCapPerSession,
} from "@/lib/form-introduction";
import { buildFormCellTaskId } from "@/lib/form-cell-task-id";
import { newTask } from "@/lib/scheduler";

describe("form-introduction", () => {
  it("sorts subjunctive cells after indicative cells at equal lemma rank", () => {
    const pres = cellIntroductionSortKey("ind.pres.1sg");
    const subj = cellIntroductionSortKey("sub.pres.1sg");
    expect(pres).toBeLessThan(subj);
    expect(isSubjunctiveCell("sub.pres.3sg")).toBe(true);
  });

  it("caps new cells per session at min(5, sessionLength)", () => {
    expect(newCellCapPerSession(15)).toBe(5);
    expect(newCellCapPerSession(3)).toBe(3);
  });

  it("soft-throttles and ceilings the daily new-cell budget", () => {
    expect(
      effectiveNewCellBudget({ sessionLength: 15, introducedTodayCount: 0 }),
    ).toBe(5);
    expect(
      effectiveNewCellBudget({ sessionLength: 15, introducedTodayCount: 10 }),
    ).toBeLessThan(5);
    expect(
      effectiveNewCellBudget({ sessionLength: 15, introducedTodayCount: 15 }),
    ).toBe(0);
  });

  it("drops fresh candidates when the introduction budget is exhausted", () => {
    const now = Date.parse("2026-08-20T12:00:00.000Z");
    const dayStart = Date.parse("2026-08-20T00:00:00.000Z");
    const introducedToday = [
      {
        taskId: buildFormCellTaskId("es", "hablar", "verb", "ind.pres.1sg"),
        reviewedAt: dayStart + 3_600_000,
      },
      {
        taskId: buildFormCellTaskId("es", "comer", "verb", "ind.pres.1sg"),
        reviewedAt: dayStart + 7_200_000,
      },
    ];
    expect(countNewCellIntroductionsToday(introducedToday, now)).toBe(2);

    const candidates = [
      { taskId: buildFormCellTaskId("es", "vivir", "verb", "ind.pres.1sg"), lemma: "vivir", cell: "ind.pres.1sg", frequencyRank: 10 },
      { taskId: buildFormCellTaskId("es", "ser", "verb", "ind.pres.1sg"), lemma: "ser", cell: "ind.pres.1sg", frequencyRank: 5 },
    ];
    const tasksByTaskId = Object.fromEntries(
      candidates.map((row) => [row.taskId, newTask(row.taskId, `es:${row.lemma}`)]),
    );

    const allowed = filterNewCellCandidates(candidates, tasksByTaskId, {
      sessionLength: 15,
      introducedTodayCount: 15,
    });
    expect(allowed).toHaveLength(0);
  });
});
