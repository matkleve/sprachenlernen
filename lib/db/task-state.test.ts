import { describe, expect, it } from "vitest";

import { loadFormRecallDeck } from "@/lib/form-recall-pool";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

/**
 * Placeholder until `lib/db/task-state.ts` ships. Contract:
 * docs/specs/service/task-state.md
 *
 * The passing test pins supplement speed-model constants to the shipped decks
 * so the documented 3704-task ceiling cannot drift silently.
 */
describe("task-state", () => {
  it("documents the Spanish pool ceiling used in the speed model", () => {
    const form = loadFormRecallDeck("es");
    const formCount = form.status === "ok" ? form.deck.cards.length : 0;

    expect(SHIPPED_ES_POOL_SIZE).toBe(2000);
    expect(formCount).toBe(1704);
    expect(SHIPPED_ES_POOL_SIZE + formCount).toBe(3704);
  });

  it.skip("parity: task_state row equals rebuild from review_log per task", () => {});

  it.skip("atomic write: review_log insert rolls back when task_state upsert fails", () => {});

  it.skip("read paths do not call listReviewsForTaskIds after cutover", () => {});
});
