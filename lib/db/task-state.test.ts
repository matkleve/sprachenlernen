import { describe, expect, it } from "vitest";

import { loadFormRecallDeck } from "@/lib/form-recall-pool";
import {
  applyReview,
  DEFAULT_CONFIG,
  newTask,
  rebuild,
  type Grade,
  type Review,
} from "@/lib/scheduler";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";
import {
  taskFromStateRow,
  taskStatePayloadFromTask,
  wordIdFromTaskId,
  type TaskStateRow,
} from "@/lib/task-from-state";

/**
 * Contract: docs/specs/service/task-state.md
 */

describe("task-state", () => {
  it("documents the Spanish pool ceiling used in the speed model", () => {
    const form = loadFormRecallDeck("es");
    const formCount = form.status === "ok" ? form.deck.cards.length : 0;

    expect(SHIPPED_ES_POOL_SIZE).toBe(2000);
    expect(formCount).toBe(1704);
    expect(SHIPPED_ES_POOL_SIZE + formCount).toBe(3704);
  });

  it("parity: task_state row equals rebuild from review_log per task", () => {
    const taskId = "es:hola:meaning-recall";
    const wordId = wordIdFromTaskId(taskId);
    const grades: Grade[] = ["good", "again", "hard", "good", "easy"];
    const reviews: Review[] = [];
    let now = Date.UTC(2026, 7, 1);

    for (const grade of grades) {
      now += 86_400_000;
      reviews.push({ at: now, grade });

      const { task: rebuilt } = rebuild(taskId, wordId, reviews, DEFAULT_CONFIG);
      const payload = taskStatePayloadFromTask(rebuilt, grade, DEFAULT_CONFIG.weightsVersion, reviews.length);
      const row: TaskStateRow = { taskId, wordId, ...payload };
      const fromState = taskFromStateRow(row);

      expect(fromState.state).toBe(rebuilt.state);
      expect(fromState.stability).toBe(rebuilt.stability);
      expect(fromState.difficulty).toBeCloseTo(rebuilt.difficulty);
      expect(Math.abs(fromState.due - rebuilt.due)).toBeLessThan(1);
      expect(fromState.lapses).toBe(rebuilt.lapses);
      expect(fromState.lastReviewAt).toBe(rebuilt.lastReviewAt);
    }
  });

  it("derives word_id from meaning-recall and form-recall task ids", () => {
    expect(wordIdFromTaskId("es:hablar:meaning-recall")).toBe("es:hablar");
    expect(wordIdFromTaskId("es:el:los:form-recall")).toBe("es:el");
  });

  it("maps absence of state rows to new tasks via tasksByTaskIdForCards", async () => {
    const { tasksByTaskIdForCards } = await import("@/lib/task-from-state");
    const cards = [{ taskId: "es:hola:meaning-recall", wordId: "es:hola" }];
    const tasks = tasksByTaskIdForCards(cards, []);
    expect(tasks["es:hola:meaning-recall"]?.state).toBe("new");
    expect(tasks["es:hola:meaning-recall"]?.reviews).toEqual([]);
  });

  it("increments review_count from materialized state, not placeholder reviews", () => {
    const taskId = "es:repeat:meaning-recall";
    const wordId = wordIdFromTaskId(taskId);
    const now = Date.UTC(2026, 8, 1);
    const existing = taskFromStateRow({
      taskId,
      wordId,
      state: "review",
      stability: 8,
      difficulty: 5,
      due: new Date(now).toISOString(),
      lastReviewAt: new Date(now - 86_400_000).toISOString(),
      lapses: 0,
      lastGrade: "good",
      reviewCount: 9,
      weightsVersion: DEFAULT_CONFIG.weightsVersion,
    });
    const { task } = applyReview(existing, "good", now + 86_400_000, DEFAULT_CONFIG);
    const payload = taskStatePayloadFromTask(task, "good", DEFAULT_CONFIG.weightsVersion, 10);

    expect(payload.reviewCount).toBe(10);
    expect(task.reviews).toHaveLength(2);
  });

  it("applyReview on fresh task matches first materialized row", () => {
    const taskId = "es:nuevo:meaning-recall";
    const wordId = wordIdFromTaskId(taskId);
    const now = Date.UTC(2026, 8, 1);
    const fresh = newTask(taskId, wordId);
    const { task } = applyReview(fresh, "good", now, DEFAULT_CONFIG);
    const row: TaskStateRow = {
      taskId,
      wordId,
      ...taskStatePayloadFromTask(task, "good"),
    };
    const { task: rebuilt } = rebuild(taskId, wordId, [{ at: now, grade: "good" }]);
    const fromState = taskFromStateRow(row);

    expect(fromState.state).toBe(rebuilt.state);
    expect(fromState.stability).toBe(rebuilt.stability);
    expect(fromState.due).toBe(rebuilt.due);
  });
});
