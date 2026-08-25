import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMenuFilter } from "@/features/method-menu/useMenuFilter";
import * as filterModule from "@/lib/method-menu-filter";

/**
 * `MethodMenu` memoises the filtered catalogue — and `pickDailyThree` over it —
 * on the `filter` this hook returns. A `filter` rebuilt on every render is a
 * new dependency on every render, so the memo downstream recomputes every time
 * while reading as if it does not. That is invisible in the UI and invisible in
 * a snapshot, so it is asserted here instead.
 */
describe("useMenuFilter", () => {
  it("returns the same filter across re-renders while the params are unchanged", () => {
    const { result, rerender } = renderHook(() => useMenuFilter({ skill: "reading" }));
    const first = result.current.filter;

    rerender();
    rerender();

    expect(result.current.filter).toBe(first);
    expect(result.current.returnQuery).toBe("?skill=reading");
  });

  it("parses once per params change, not once per render", () => {
    const parse = vi.spyOn(filterModule, "parseMenuFilter");
    const { rerender } = renderHook(() => useMenuFilter({ skill: "reading" }));
    const afterFirstRender = parse.mock.calls.length;

    rerender();
    rerender();

    expect(parse.mock.calls.length).toBe(afterFirstRender);
    parse.mockRestore();
  });

});
