/**
 * Contract: docs/specs/feature/listening-defer.md
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearListeningDefer,
  LISTENING_DEFER_DURATION_MS,
  LISTENING_DEFER_STORAGE_KEY,
  listeningDeferRemainingMs,
  readListeningDeferExpiry,
  startListeningDefer,
} from "@/lib/listening-defer";

describe("listening-defer", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-18T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a 15-minute defer", () => {
    const now = Date.now();
    const expiry = startListeningDefer(now);
    expect(expiry - now).toBe(LISTENING_DEFER_DURATION_MS);
    expect(window.localStorage.getItem(LISTENING_DEFER_STORAGE_KEY)).toBe(String(expiry));
  });

  it("reads active defer before expiry", () => {
    startListeningDefer();
    expect(readListeningDeferExpiry()).toBe(Date.now() + LISTENING_DEFER_DURATION_MS);
    expect(listeningDeferRemainingMs()).toBe(LISTENING_DEFER_DURATION_MS);
  });

  it("clears expired defer on read", () => {
    startListeningDefer();
    vi.setSystemTime(Date.now() + LISTENING_DEFER_DURATION_MS + 1);
    expect(readListeningDeferExpiry()).toBeNull();
    expect(window.localStorage.getItem(LISTENING_DEFER_STORAGE_KEY)).toBeNull();
  });

  it("clears defer immediately", () => {
    startListeningDefer();
    clearListeningDefer();
    expect(readListeningDeferExpiry()).toBeNull();
  });
});
