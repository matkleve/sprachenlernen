import { describe, expect, it } from "vitest";

import { AGAIN_REQUEUE_AHEAD, requeueInsertIndex } from "@/lib/review-session-requeue";

describe("requeueInsertIndex", () => {
  it("does not requeue on good or easy", () => {
    expect(requeueInsertIndex(0, 15, "good")).toBeNull();
    expect(requeueInsertIndex(0, 15, "easy")).toBeNull();
  });

  it("sends hard to the end of the queue", () => {
    expect(requeueInsertIndex(3, 15, "hard")).toBe(15);
  });

  it("sends again five positions ahead when room remains", () => {
    expect(requeueInsertIndex(0, 15, "again")).toBe(1 + AGAIN_REQUEUE_AHEAD);
    expect(requeueInsertIndex(2, 15, "again")).toBe(2 + 1 + AGAIN_REQUEUE_AHEAD);
  });

  it("sends again to the end when fewer than five cards remain after the current one", () => {
    expect(requeueInsertIndex(12, 15, "again")).toBe(15);
    expect(requeueInsertIndex(14, 15, "again")).toBe(15);
  });
});
