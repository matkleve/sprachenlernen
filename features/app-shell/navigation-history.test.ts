import { afterEach, describe, expect, it } from "vitest";

import {
  NAVIGATION_PREVIOUS_KEY,
  advanceNavigationPath,
  readNavigationPrevious,
  resetNavigationHistoryForTests,
} from "@/features/app-shell/navigation-history";

describe("navigation-history", () => {
  afterEach(() => {
    resetNavigationHistoryForTests();
  });

  it("records the previous path synchronously on navigation", () => {
    advanceNavigationPath("/words");
    advanceNavigationPath("/profile");

    expect(readNavigationPrevious()).toBe("/words");
  });

  it("does not record a previous path on the first visit", () => {
    advanceNavigationPath("/profile");

    expect(readNavigationPrevious()).toBeNull();
  });

  it("prefers in-memory history over stale session storage", () => {
    sessionStorage.setItem(NAVIGATION_PREVIOUS_KEY, "/methods");

    advanceNavigationPath("/words");
    advanceNavigationPath("/profile");

    expect(readNavigationPrevious()).toBe("/words");
  });
});
