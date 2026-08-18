import { describe, expect, it, vi } from "vitest";

import {
  createInMemoryReviewQueueStorage,
  createReviewWriteQueue,
  type FlushReviewInput,
} from "@/lib/db/review-write-queue";

const baseInput: FlushReviewInput = {
  reviewId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  taskId: "task-1",
  grade: "good",
  reviewedAtMs: Date.parse("2026-08-10T12:00:00.000Z"),
  latencyMs: 400,
  installationId: "11111111-1111-4111-8111-111111111111",
};

describe("review-write-queue", () => {
  it("flushes a queued row and clears it on success", async () => {
    const flush = vi.fn().mockResolvedValue({ status: "appended" });
    const queue = createReviewWriteQueue({
      storage: createInMemoryReviewQueueStorage(),
      flush,
    });

    await queue.enqueue(baseInput);
    await queue.flushAll();

    expect(flush).toHaveBeenCalledWith(baseInput);
    expect(queue.getState().pending).toBe(0);
  });

  it("keeps a failed row for retry", async () => {
    const flush = vi
      .fn()
      .mockResolvedValueOnce({ status: "error", error: "offline" })
      .mockResolvedValueOnce({ status: "appended" });

    const queue = createReviewWriteQueue({
      storage: createInMemoryReviewQueueStorage(),
      flush,
    });

    await queue.enqueue(baseInput);
    expect(queue.getState().failed).toBe(1);

    await queue.retryFailed();
    expect(queue.getState().pending).toBe(0);
    expect(flush).toHaveBeenCalledTimes(2);
  });

  it("surfaces review/flush-failed copy only after retries are exhausted", async () => {
    const flush = vi.fn().mockResolvedValue({ status: "error", error: "offline" });
    const queue = createReviewWriteQueue({
      storage: createInMemoryReviewQueueStorage(),
      flush,
    });

    await queue.enqueue(baseInput);
    expect(queue.getState().lastError).toBeNull();

    for (let attempt = 0; attempt < 3; attempt++) {
      await queue.flushAll();
      expect(queue.getState().lastError).toBeNull();
    }

    await queue.flushAll();
    expect(queue.getState().lastError).toBe("Your grade could not be saved.");
  });

  it("resets attempt count on scheduled retry", async () => {
    const flush = vi.fn().mockResolvedValue({ status: "error", error: "offline" });
    const queue = createReviewWriteQueue({
      storage: createInMemoryReviewQueueStorage(),
      flush,
    });

    await queue.enqueue(baseInput);
    for (let attempt = 0; attempt < 3; attempt++) {
      await queue.flushAll();
    }
    await queue.flushAll();
    expect(queue.getState().lastError).toBe("Your grade could not be saved.");

    vi.mocked(flush).mockResolvedValue({ status: "appended" });
    await queue.retryFailed();
    expect(queue.getState().lastError).toBeNull();
    expect(queue.getState().pending).toBe(0);
  });

  it("notifies subscribers when pending count changes", async () => {
    const listener = vi.fn();
    const flush = vi.fn().mockResolvedValue({ status: "appended" });
    const queue = createReviewWriteQueue({
      storage: createInMemoryReviewQueueStorage(),
      flush,
    });

    queue.subscribe(listener);
    await queue.enqueue(baseInput);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ pending: 1 }));

    await queue.flushAll();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ pending: 0 }));
  });
});
