import { NextIntlClientProvider } from "next-intl";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";

import { useShellBackTarget } from "./use-shell-back-target";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useShellBackTarget", () => {
  it("returns null on destination roots", () => {
    const { result: methods } = renderHook(() => useShellBackTarget("/methods"), { wrapper });
    const { result: words } = renderHook(() => useShellBackTarget("/words"), { wrapper });
    const { result: progress } = renderHook(() => useShellBackTarget("/progress"), { wrapper });

    expect(methods.current).toBeNull();
    expect(words.current).toBeNull();
    expect(progress.current).toBeNull();
  });

  it("links review to Words", () => {
    const { result } = renderHook(() => useShellBackTarget("/words/review"), { wrapper });
    expect(result.current).toEqual({
      href: "/words",
      label: en.appShell.destinations.words,
    });
  });

  it("links method detail to Methods", () => {
    const { result } = renderHook(() => useShellBackTarget("/methods/srs-session"), { wrapper });
    expect(result.current).toEqual({
      href: "/methods",
      label: en.appShell.destinations.methods,
    });
  });
});
