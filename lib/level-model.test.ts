import { describe, expect, it } from "vitest";

import {
  LAYER_1_SIGNALS,
  SKILLS,
  countingSkills,
  readLevel,
  signalsFeedingSkill,
} from "@/lib/level-model";
import { newTask, rebuild, type Review, type Task } from "@/lib/scheduler";

/**
 * Contract: docs/specs/page/progress.md, deriving docs/study/03-level-model.md.
 */

const DAY = 86_400_000;
const now = Date.UTC(2026, 7, 9);

function reviewed(id: string, grades: Review["grade"][]): Task {
  const reviews: Review[] = grades.map((grade, index) => ({
    at: now - (grades.length - index) * 3 * DAY,
    grade,
  }));
  return rebuild(id, `word:${id}`, reviews).task;
}

describe("skills", () => {
  it("reports every skill as not measured when nothing has been reviewed", () => {
    const reading = readLevel([], now);

    expect(reading.skills.map((skill) => skill.skill)).toEqual([...SKILLS]);
    for (const skill of reading.skills) {
      expect(skill.status, `${skill.skill} must be not-measured`).toBe("not-measured");
    }
  });

  it("still reports every skill as not measured after a full review history", () => {
    // The criterion that carries this page. Meaning-recall of isolated lemmas
    // produces recall stability, and recall stability feeds no skill — so a
    // learner who has reviewed for weeks has still not been measured on
    // reading, listening, speaking or writing. A page that quietly promoted
    // "has practised" to "has been measured" would look identical and be the
    // exact failure UC-004 exists to prevent.
    const tasks = [
      reviewed("t1", ["good", "good", "good"]),
      reviewed("t2", ["hard", "good", "easy"]),
      reviewed("t3", ["again", "good", "good"]),
    ];

    const reading = readLevel(tasks, now);

    for (const skill of reading.skills) {
      expect(skill.status, `${skill.skill} must be not-measured`).toBe("not-measured");
    }
  });

  it("names, per skill, the signals whose arrival would measure it", () => {
    // Not decoration: "not measured, with the route to it" is the half of the
    // status that makes it actionable rather than an apology (UC-004).
    expect(signalsFeedingSkill("reading")).toContain("lexical-coverage");
    expect(signalsFeedingSkill("speaking")).toContain("production-quality");
    expect(signalsFeedingSkill("writing")).toContain("production-quality");

    // Recall stability is not a skill signal anywhere in study/03. If this
    // ever passes, someone has attached the one signal we can compute to a
    // skill in order to have something to show.
    for (const skill of SKILLS) {
      expect(signalsFeedingSkill(skill), `${skill}`).not.toContain("recall-stability");
    }
  });
});

describe("the overall level", () => {
  it("is withheld, with a reason, when fewer than two skills count", () => {
    const reading = readLevel([reviewed("t1", ["good", "good"])], now);

    expect(reading.overall.status).toBe("withheld");
    if (reading.overall.status !== "withheld") return;

    expect(reading.overall.reason).toBe("fewer-than-two-counting-skills");
    expect(countingSkills(reading.skills)).toHaveLength(0);
  });
});

describe("layer-1 signals", () => {
  it("lists all seven, and marks the ones with no data as such", () => {
    const reading = readLevel([], now);

    expect(reading.signals.map((signal) => signal.id)).toEqual([...LAYER_1_SIGNALS]);
    for (const signal of reading.signals) {
      expect(signal.status, `${signal.id}`).toBe("no-data");
      expect(signal.value, `${signal.id}`).toBeNull();
    }
  });

  it("gives recall stability a value once tasks carry review history", () => {
    const tasks = [
      reviewed("t1", ["good", "good", "good"]),
      reviewed("t2", ["good", "good", "good"]),
    ];

    const stability = readLevel(tasks, now).signals.find((s) => s.id === "recall-stability")!;

    expect(stability.status).toBe("has-data");
    expect(stability.value).toBeGreaterThan(0);
    expect(stability.taskCount).toBe(2);
  });

  it("excludes tasks with no reviews from the stability figure", () => {
    // A new task has no stability. Counting it as zero would make the one
    // number on this page fall every time the learner meets a new word —
    // the opposite of what it is for.
    const tasks: Task[] = [
      reviewed("t1", ["good", "good", "good"]),
      newTask("t2", "word:t2"),
      newTask("t3", "word:t3"),
    ];

    const stability = readLevel(tasks, now).signals.find((s) => s.id === "recall-stability")!;

    expect(stability.taskCount).toBe(1);
    expect(stability.value).toBeCloseTo(
      readLevel([reviewed("t1", ["good", "good", "good"])], now).signals.find(
        (s) => s.id === "recall-stability",
      )!.value!,
      6,
    );
  });

  it("falls when recall gets worse — the number must be able to go down", () => {
    // study/25 C3 and study/03 honesty rule 1. A display that can only rise
    // is a score, not a measurement, and this is the only assertion that
    // distinguishes the two.
    const strong = readLevel([reviewed("t1", ["easy", "easy", "easy"])], now);
    const weak = readLevel([reviewed("t1", ["again", "again", "hard"])], now);

    const value = (reading: ReturnType<typeof readLevel>) =>
      reading.signals.find((s) => s.id === "recall-stability")!.value!;

    expect(value(weak)).toBeLessThan(value(strong));
  });
});
