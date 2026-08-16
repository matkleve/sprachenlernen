import { describe, expect, it } from "vitest";

import { copy as methodMenuCopy } from "@/features/method-menu/content";
import { copy as progressCopy } from "@/features/progress/content";
import { copy as reviewCopy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";

import { holding } from "./content";
import { shellPageTitle } from "./page-title";
import { shellHeaderStartsCompact } from "./ShellPageTitle";

describe("shellPageTitle", () => {
  it("returns the destination title on each root route", () => {
    expect(shellPageTitle(routes.methods)).toBe(methodMenuCopy.title);
    expect(shellPageTitle(routes.words)).toBe(holding.words.title);
    expect(shellPageTitle(routes.progress)).toBe(progressCopy.title);
  });

  it("returns Review on the words review route", () => {
    expect(shellPageTitle(routes.wordsReview)).toBe(reviewCopy.title);
  });

  it("returns the methods list title on a method detail route", () => {
    expect(shellPageTitle("/methods/srs-session")).toBe(methodMenuCopy.title);
  });

  it("starts compact on the review route", () => {
    expect(shellHeaderStartsCompact(routes.wordsReview)).toBe(true);
    expect(shellHeaderStartsCompact(routes.words)).toBe(false);
  });
});
