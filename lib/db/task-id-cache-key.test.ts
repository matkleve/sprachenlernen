import { describe, expect, it } from "vitest";

import { taskIdsCacheKey } from "@/lib/db/task-id-cache-key";

describe("taskIdsCacheKey", () => {
  it("treats duplicate and differently ordered ids as the same set", () => {
    expect(taskIdsCacheKey(["b", "a", "b"])).toBe(taskIdsCacheKey(["a", "b"]));
  });

  it("distinguishes different id sets", () => {
    expect(taskIdsCacheKey(["a"])).not.toBe(taskIdsCacheKey(["b"]));
  });
});
