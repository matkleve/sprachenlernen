import { globSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import {
  CARD_ENGINE_METHOD_ID,
  cardEngineSessionHref,
  cardHrefForMethod,
  exerciseSessionHref,
  sessionHrefForMethod,
  usesExerciseRunner,
  usesWordsReview,
} from "@/lib/method-session";
import { routes } from "@/lib/routes";
import {
  isActiveExerciseSession,
  shellPageLayout,
} from "@/lib/shell-page-layout";

function method(over: Partial<MethodEntry> & Pick<MethodEntry, "id">): MethodEntry {
  return {
    type: "method",
    name: over.id,
    summary: "",
    section: "vocabulary",
    trains: "",
    skills: [],
    targetSignal: "recallStability",
    evidence: "A",
    demanding: false,
    hosted: true,
    intensity: 2,
    durations: [10],
    requires: {},
    offerEveryDays: null,
    doesNotDo: "",
    ...over,
  };
}

describe("usesWordsReview", () => {
  it("is true only for srs-session", () => {
    expect(usesWordsReview(method({ id: "srs-session" }))).toBe(true);
    expect(usesWordsReview(method({ id: "extensive-reading" }))).toBe(false);
  });
});

describe("usesExerciseRunner", () => {
  it("is true only for built exercise methods", () => {
    expect(usesExerciseRunner(method({ id: "partial-dictation" }))).toBe(true);
    expect(usesExerciseRunner(method({ id: "full-dictation" }))).toBe(true);
    expect(usesExerciseRunner(method({ id: "extensive-reading" }))).toBe(false);
    expect(usesExerciseRunner(method({ id: "srs-session" }))).toBe(false);
  });
});

describe("exerciseSessionHref", () => {
  it("builds practice URL with optional sourceId", () => {
    expect(exerciseSessionHref("partial-dictation")).toBe(
      `${routes.practice}?method=partial-dictation`,
    );
    expect(exerciseSessionHref("partial-dictation", "src-1")).toBe(
      `${routes.practice}?method=partial-dictation&sourceId=src-1`,
    );
  });
});

describe("cardHrefForMethod", () => {
  it("links srs-session to Words review", () => {
    expect(cardHrefForMethod(method({ id: "srs-session" }))).toBe(
      sessionHrefForMethod(method({ id: "srs-session" })),
    );
  });

  it("links partial-dictation to practice", () => {
    expect(cardHrefForMethod(method({ id: "partial-dictation" }))).toBe(
      exerciseSessionHref("partial-dictation"),
    );
  });

  it("links full-dictation to practice", () => {
    expect(cardHrefForMethod(method({ id: "full-dictation" }))).toBe(
      exerciseSessionHref("full-dictation"),
    );
  });

  it("links other hosted methods to detail", () => {
    expect(cardHrefForMethod(method({ id: "extensive-reading" }), "?skill=reading")).toBe(
      "/methods/extensive-reading?skill=reading",
    );
  });

  it("links off-app methods to detail", () => {
    expect(cardHrefForMethod(method({ id: "tandem", hosted: false }))).toBe("/methods/tandem");
  });
});

describe("shellPageLayout practice", () => {
  it("uses one-screen-runner for built exercise methods", () => {
    for (const methodId of ["partial-dictation", "full-dictation"]) {
      const params = new URLSearchParams({ method: methodId });
      expect(isActiveExerciseSession(routes.practice, params)).toBe(true);
      expect(shellPageLayout(routes.practice, params)).toBe("one-screen-runner");
    }
  });

  it("uses drill-in for unknown exercise method", () => {
    const params = new URLSearchParams({ method: "extensive-reading" });
    expect(isActiveExerciseSession(routes.practice, params)).toBe(false);
    expect(shellPageLayout(routes.practice, params)).toBe("scrollable-drill-in");
  });
});

describe("the card engine has one id", () => {
  it("is the only thing that opens a card runner — no surface builds the href by hand", () => {
    const files = globSync("{app,features}/**/*.{ts,tsx}", { cwd: process.cwd() })
      .filter((file) => !file.includes(".test."));

    const handBuilt = files.filter((file) =>
      /[?&]method=srs-session|"srs-session"/.test(readFileSync(file, "utf8")),
    );

    expect(handBuilt).toEqual([]);
  });

  it("routes the card engine through the shared href", () => {
    expect(cardEngineSessionHref()).toBe(
      `${routes.wordsReview}?method=${CARD_ENGINE_METHOD_ID}`,
    );
  });
});
