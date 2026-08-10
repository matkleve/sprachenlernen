/**
 * Browser-local review write queue. Contract:
 * docs/specs/service/review-write-queue.md
 *
 * Grades enqueue locally and flush to the server in the background. IndexedDB
 * in the browser; injectable storage in tests.
 */

import type { Grade } from "@/lib/scheduler";

export type QueuedReviewRow = {
  reviewId: string;
  taskId: string;
  grade: Grade;
  reviewedAtMs: number;
  latencyMs: number;
  installationId: string;
  queuedAt: number;
  attempts: number;
  state: "pending" | "flushing" | "failed";
  lastError?: string;
};

export type EnqueueReviewInput = Omit<
  QueuedReviewRow,
  "queuedAt" | "attempts" | "state" | "lastError"
>;

export type FlushReviewInput = EnqueueReviewInput;

export type FlushReviewResult =
  | { status: "appended" }
  | { status: "error"; error: string };

export interface ReviewQueueStorage {
  list(): Promise<QueuedReviewRow[]>;
  put(row: QueuedReviewRow): Promise<void>;
  remove(reviewId: string): Promise<void>;
}

export type ReviewQueueState = {
  pending: number;
  failed: number;
  lastError: string | null;
  /** Earliest time any row has been pending — for the 500 ms flicker guard. */
  pendingSince: number | null;
};

export type ReviewWriteQueue = {
  enqueue(input: EnqueueReviewInput): Promise<void>;
  flushAll(): Promise<void>;
  retryFailed(): Promise<void>;
  getState(): ReviewQueueState;
  subscribe(listener: (state: ReviewQueueState) => void): () => void;
};

const DB_NAME = "sl-review-queue";
const STORE = "pending";
const RETRY_MS = 5_000;

export function createInMemoryReviewQueueStorage(): ReviewQueueStorage {
  const rows = new Map<string, QueuedReviewRow>();
  return {
    async list() {
      return [...rows.values()].sort((a, b) => a.queuedAt - b.queuedAt);
    },
    async put(row) {
      rows.set(row.reviewId, row);
    },
    async remove(reviewId) {
      rows.delete(reviewId);
    },
  };
}

export function createIndexedDbReviewQueueStorage(): ReviewQueueStorage {
  function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: "reviewId" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed."));
    });
  }

  async function withStore<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const store = transaction.objectStore(STORE);
      const request = run(store);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    });
  }

  return {
    list: () =>
      withStore("readonly", (store) => store.getAll()).then((rows) =>
        (rows as QueuedReviewRow[]).sort((a, b) => a.queuedAt - b.queuedAt),
      ),
    put: (row) => withStore("readwrite", (store) => store.put(row)).then(() => undefined),
    remove: (reviewId) =>
      withStore("readwrite", (store) => store.delete(reviewId)).then(() => undefined),
  };
}

function readState(rows: QueuedReviewRow[]): ReviewQueueState {
  const active = rows.filter((row) => row.state !== "flushing");
  const pendingRows = active.filter((row) => row.state === "pending");
  const failedRows = active.filter((row) => row.state === "failed");
  const pendingSince =
    pendingRows.length > 0 ? Math.min(...pendingRows.map((row) => row.queuedAt)) : null;

  return {
    pending: pendingRows.length,
    failed: failedRows.length,
    lastError: failedRows.find((row) => row.lastError)?.lastError ?? null,
    pendingSince,
  };
}

export function createReviewWriteQueue(options: {
  storage: ReviewQueueStorage;
  flush: (input: FlushReviewInput) => Promise<FlushReviewResult>;
}): ReviewWriteQueue {
  const listeners = new Set<(state: ReviewQueueState) => void>();
  let cache: QueuedReviewRow[] = [];
  let flushing = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function notify() {
    const state = readState(cache);
    for (const listener of listeners) listener(state);
  }

  async function reload() {
    try {
      cache = await options.storage.list();
    } catch {
      // IndexedDB can be blocked (private browsing, storage full). Treat as empty
      // rather than taking down the review session — grades still queue in-memory
      // for this visit via the fallback storage in getReviewQueue().
      cache = [];
    }
    notify();
  }

  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void flushAll();
    }, RETRY_MS);
  }

  let flushChain: Promise<void> = Promise.resolve();

  async function flushAll() {
    flushChain = flushChain.then(async () => {
      if (flushing) return;
      flushing = true;
      try {
        await reload();
        for (const row of [...cache]) {
          if (row.state === "failed" && row.attempts >= 5) continue;

          const flushingRow: QueuedReviewRow = { ...row, state: "flushing" };
          await options.storage.put(flushingRow);
          await reload();

          const result = await options.flush({
            reviewId: row.reviewId,
            taskId: row.taskId,
            grade: row.grade,
            reviewedAtMs: row.reviewedAtMs,
            latencyMs: row.latencyMs,
            installationId: row.installationId,
          });

          if (result.status === "appended") {
            await options.storage.remove(row.reviewId);
          } else {
            await options.storage.put({
              ...row,
              state: "failed",
              attempts: row.attempts + 1,
              lastError: result.error,
            });
            scheduleRetry();
          }
          await reload();
        }
      } finally {
        flushing = false;
      }
    });
    return flushChain;
  }

  return {
    async enqueue(input) {
      const row: QueuedReviewRow = {
        ...input,
        queuedAt: Date.now(),
        attempts: 0,
        state: "pending",
      };
      await options.storage.put(row);
      await reload();
      await flushAll();
    },
    flushAll,
    async retryFailed() {
      await reload();
      for (const row of cache) {
        if (row.state !== "failed") continue;
        await options.storage.put({ ...row, state: "pending", lastError: undefined });
      }
      await reload();
      await flushAll();
    },
    getState() {
      return readState(cache);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(readState(cache));
      void reload();
      return () => listeners.delete(listener);
    },
  };
}
