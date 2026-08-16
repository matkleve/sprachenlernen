import { renderWithIntl as render, en, serverT } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { ProgressReport } from "@/features/progress/ProgressReport";
import { DOSE_BAND_SOURCE, hoursPerYear, yearsToReach } from "@/lib/dose-band";
import { readLevel } from "@/lib/level-model";
import { rebuild, type Review } from "@/lib/scheduler";
import type { WeeklyReflectionModel } from "@/lib/weekly-reflection";

/**
 * Contract: docs/specs/page/progress.md
 */

const t = serverT("progress");

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

function reviewedTask(id: string, grades: Review["grade"][]) {
  const taskId = id.includes(":meaning-recall") ? id : `${id}:meaning-recall`;
  const wordId = taskId.replace(/:meaning-recall$/, "");
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(taskId, wordId, reviews).task;
}

function reviewedFormTask(id: string, grades: Review["grade"][]) {
  const wordId = id.replace(/:[^:]+:form-recall$/, "");
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(id, wordId, reviews).task;
}

const empty = readLevel([], now);
const withHistory = readLevel(
  [
    reviewedTask("es:t1", ["good", "good", "good"]),
    reviewedTask("es:t2", ["hard", "good"]),
  ],
  now,
);
const withFormHistory = readLevel(
  [reviewedFormTask("es:hablar:habla:form-recall", ["easy", "easy", "easy"])],
  now,
);

/** Leaves only — `textContent` welds siblings together (docs/TRAPS.md). */
function leafText(container: HTMLElement): string {
  return Array.from(container.querySelectorAll("*"))
    .filter((element) => element.children.length === 0)
    .map((element) => element.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" | ");
}

const hiddenReflection: WeeklyReflectionModel = { status: "hidden" };

async function renderProgress(reading: typeof empty) {
  return render(await ProgressReport({ reading, reflection: hiddenReflection }));
}

describe("ProgressReport", () => {
  it("shows all four skills as not measured when nothing has been reviewed", async () => {
    await renderProgress(empty);

    expect(screen.getAllByText(en.progress.statusNames["not-measured"])).toHaveLength(4);
    expect(screen.getByText(en.progress.emptyState)).toBeDefined();
  });

  it("still shows all four as not measured once there is review history", async () => {
    await renderProgress(withHistory);

    expect(screen.getAllByText(en.progress.statusNames["not-measured"])).toHaveLength(4);
  });

  it("withholds the overall level and says which rule withholds it", async () => {
    await renderProgress(empty);

    expect(screen.getByText(en.progress.overallWithheld)).toBeDefined();
  });

  it("shows recall stability as a value with its derivation, and no CEFR level", async () => {
    await renderProgress(withHistory);

    const stability = withHistory.signals.find((signal) => signal.id === "recall-stability")!;
    expect(
      screen.getByText(
        t("stabilityValue", {
          days: stability.value!,
          taskCount: stability.taskCount,
        }),
      ),
    ).toBeDefined();

    const vocabulary = withHistory.signals.find((signal) => signal.id === "vocabulary-size")!;
    expect(
      screen.getByText(
        t("vocabularyValue", {
          held: vocabulary.value!,
          poolSize: vocabulary.taskCount,
        }),
      ),
    ).toBeDefined();

    const signalsTable = screen.getByRole("table", { name: en.progress.signalsCaption });
    expect(leafText(signalsTable)).not.toMatch(/\b[ABC][12](\.\d)?\b/);
  });

  it("shows form mastery when form-recall tasks have been reviewed", async () => {
    await renderProgress(withFormHistory);

    const formMastery = withFormHistory.signals.find((signal) => signal.id === "form-mastery")!;
    expect(
      screen.getByText(
        t("formMasteryValue", {
          held: formMastery.value!,
          poolSize: formMastery.taskCount,
        }),
      ),
    ).toBeDefined();
  });

  it("shows the dose band with its borrowed label, and no numerator", async () => {
    await renderProgress(withHistory);

    expect(screen.getByText(t("doseHours", { min: 350, max: 400 }))).toBeDefined();
    expect(
      screen.getByText(t("doseBorrowedUncalibrated", { name: DOSE_BAND_SOURCE.name })),
    ).toBeDefined();
    expect(screen.getByText(en.progress.doseNoNumerator)).toBeDefined();
  });

  it("reproduces the chapter's arithmetic rather than inventing a second one", async () => {
    await renderProgress(empty);

    expect(screen.getByText(t("doseHabit", { hours: Math.round(hoursPerYear(15)) }))).toBeDefined();

    const b1 = yearsToReach("B1", 15)!;
    expect(screen.getByText(t("doseYears", { minYears: b1.minYears, maxYears: b1.maxYears }))).toBeDefined();
  });

  it("uses fit tables without nested horizontal scroll on destination pages", async () => {
    const { container } = await renderProgress(withHistory);

    expect(container.querySelector(".overflow-x-auto")).toBeNull();
    expect(screen.getAllByRole("table")).toHaveLength(3);
  });

  it("names what is still missing for language-wide levels", async () => {
    await renderProgress(withHistory);

    expect(screen.getByText(en.progress.gapBody)).toBeDefined();
  });

  it("presents no count that can only rise as progress", async () => {
    for (const reading of [empty, withHistory]) {
      const { container, unmount } = await renderProgress(reading);
      expect(leafText(container)).not.toMatch(/\bstreak\b|\bXP\b|\bpoints\b|\bday streak\b/i);
      unmount();
    }
  });
});
