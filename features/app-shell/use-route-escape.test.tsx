import { NextIntlClientProvider } from "next-intl";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import {
  advanceNavigationPath,
  resetNavigationHistoryForTests,
} from "@/features/app-shell/navigation-history";
import { useRouteEscape } from "@/features/app-shell/use-route-escape";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useRouteEscape", () => {
  beforeEach(() => {
    resetNavigationHistoryForTests();
  });

  afterEach(() => {
    resetNavigationHistoryForTests();
  });

  it("returns null on destination routes", () => {
    const { result } = renderHook(() => useRouteEscape("/words"), { wrapper });
    expect(result.current).toBeNull();
  });

  it("links back to Words when the learner came from Words", () => {
    advanceNavigationPath("/words");
    advanceNavigationPath("/profile");

    const { result } = renderHook(() => useRouteEscape("/profile"), { wrapper });

    expect(result.current).toEqual({
      href: "/words",
      label: en.appShell.backTo.replace("{destination}", en.appShell.destinations.words),
    });
  });

  it("links back to Progress when the learner came from Progress", () => {
    advanceNavigationPath("/progress");
    advanceNavigationPath("/profile");

    const { result } = renderHook(() => useRouteEscape("/profile"), { wrapper });

    expect(result.current?.href).toBe("/progress");
    expect(result.current?.label).toBe(
      en.appShell.backTo.replace("{destination}", en.appShell.destinations.progress),
    );
  });

  it("falls back to Methods when there is no navigation history", () => {
    advanceNavigationPath("/profile");

    const { result } = renderHook(() => useRouteEscape("/profile"), { wrapper });

    expect(result.current?.href).toBe("/methods");
    expect(result.current?.label).toBe(
      en.appShell.backTo.replace("{destination}", en.appShell.destinations.methods),
    );
  });
});
