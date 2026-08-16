import { NextIntlClientProvider } from "next-intl";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import { routes } from "@/lib/routes";

import { shellHeaderStartsCompact } from "./ShellPageTitle";
import { useShellPageTitle } from "./use-shell-page-title";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useShellPageTitle", () => {
  it("returns the destination title on each root route", () => {
    const { result: methods } = renderHook(() => useShellPageTitle(routes.methods), { wrapper });
    const { result: words } = renderHook(() => useShellPageTitle(routes.words), { wrapper });
    const { result: progress } = renderHook(() => useShellPageTitle(routes.progress), { wrapper });

    expect(methods.current).toBe(en.methodMenu.title);
    expect(words.current).toBe(en.appShell.holding.words.title);
    expect(progress.current).toBe(en.progress.title);
  });

  it("returns Review on the words review route", () => {
    const { result } = renderHook(() => useShellPageTitle(routes.wordsReview), { wrapper });
    expect(result.current).toBe(en.reviewSession.title);
  });

  it("returns Methods on a method detail route", () => {
    const { result } = renderHook(() => useShellPageTitle("/methods/srs-session"), { wrapper });
    expect(result.current).toBe(en.methodMenu.drillInShellTitle);
  });

  it("starts compact on the review route", () => {
    expect(shellHeaderStartsCompact(routes.wordsReview)).toBe(true);
    expect(shellHeaderStartsCompact(routes.words)).toBe(false);
  });
});
