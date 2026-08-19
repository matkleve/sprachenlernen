import { globSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import {
  CARD_ENGINE_METHOD_ID,
  cardDestinationMarker,
  cardEngineSessionHref,
  cardHrefForMethod,
  exerciseSessionHref,
  isRunnableFromMenu,
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
  it("is true for all six built exercise methods", () => {
    for (const id of [
      "partial-dictation",
      "full-dictation",
      "extensive-reading",
      "reading-aloud",
      "build-a-sentence",
      "free-production",
    ]) {
      expect(usesExerciseRunner(method({ id }))).toBe(true);
    }
    expect(usesExerciseRunner(method({ id: "narrow-reading" }))).toBe(false);
    expect(usesExerciseRunner(method({ id: "srs-session" }))).toBe(false);
  });
});

describe("exerciseSessionHref", () => {
  it("builds practice URL with optional sourceId and budgetMinutes", () => {
    expect(exerciseSessionHref("partial-dictation")).toBe(
      `${routes.practice}?method=partial-dictation`,
    );
    expect(exerciseSessionHref("partial-dictation", { sourceId: "src-1" })).toBe(
      `${routes.practice}?method=partial-dictation&sourceId=src-1`,
    );
    expect(
      exerciseSessionHref("partial-dictation", { sourceId: "src-1", budgetMinutes: 15 }),
    ).toBe(`${routes.practice}?method=partial-dictation&sourceId=src-1&minutes=15`);
  });
});

describe("sessionHrefForMethod", () => {
  it("adds minutes to words review for srs-session", () => {
    const href = sessionHrefForMethod(method({ id: "srs-session" }), { budgetMinutes: 20 });
    expect(href).toBe(`${routes.wordsReview}?method=srs-session&minutes=20`);
  });
});

describe("cardDestinationMarker", () => {
  it("is start for runnable methods", () => {
    expect(cardDestinationMarker(method({ id: "srs-session" }))).toBe("start");
    expect(cardDestinationMarker(method({ id: "partial-dictation" }))).toBe("start");
  });

  it("is info for detail-only methods", () => {
    expect(cardDestinationMarker(method({ id: "narrow-reading" }))).toBe("info");
    expect(cardDestinationMarker(method({ id: "tandem", hosted: false }))).toBe("info");
  });
});

describe("isRunnableFromMenu", () => {
  it("marks card engine and built exercise methods as runnable", () => {
    const runnable = method({ id: "extensive-reading" });
    const detail = method({ id: "narrow-listening" });
    expect(isRunnableFromMenu(runnable)).toBe(true);
    expect(isRunnableFromMenu(detail)).toBe(false);
    expect(cardHrefForMethod(runnable).startsWith("/methods/")).toBe(true);
    expect(cardHrefForMethod(detail).startsWith("/methods/")).toBe(true);
  });
});

describe("cardHrefForMethod", () => {
  it("links srs-session to Words review", () => {
    expect(cardHrefForMethod(method({ id: "srs-session" }))).toBe(
      sessionHrefForMethod(method({ id: "srs-session" })),
    );
  });

  it("links partial-dictation to method overview", () => {
    expect(cardHrefForMethod(method({ id: "partial-dictation" }))).toBe(
      "/methods/partial-dictation",
    );
  });

  it("links full-dictation to method overview", () => {
    expect(cardHrefForMethod(method({ id: "full-dictation" }))).toBe(
      "/methods/full-dictation",
    );
  });

  it("links extensive-reading to method overview", () => {
    expect(cardHrefForMethod(method({ id: "extensive-reading" }))).toBe(
      "/methods/extensive-reading",
    );
  });

  it("links reading-aloud to method overview", () => {
    expect(cardHrefForMethod(method({ id: "reading-aloud" }))).toBe(
      "/methods/reading-aloud",
    );
  });

  it("links build-a-sentence to method overview", () => {
    expect(cardHrefForMethod(method({ id: "build-a-sentence" }))).toBe(
      "/methods/build-a-sentence",
    );
  });

  it("links free-production to method overview", () => {
    expect(cardHrefForMethod(method({ id: "free-production" }))).toBe(
      "/methods/free-production",
    );
  });

  it("links other hosted methods to detail", () => {
    expect(cardHrefForMethod(method({ id: "narrow-reading" }), "?skill=reading")).toBe(
      "/methods/narrow-reading?skill=reading",
    );
  });

  it("links off-app methods to detail", () => {
    expect(cardHrefForMethod(method({ id: "tandem", hosted: false }))).toBe("/methods/tandem");
  });
});

describe("shellPageLayout practice", () => {
  it("uses one-screen-exercise for built exercise methods", () => {
    for (const methodId of [
      "partial-dictation",
      "full-dictation",
      "extensive-reading",
      "reading-aloud",
      "build-a-sentence",
      "free-production",
    ]) {
      const params = new URLSearchParams({ method: methodId });
      expect(isActiveExerciseSession(routes.practice, params)).toBe(true);
      expect(shellPageLayout(routes.practice, params)).toBe("one-screen-exercise");
    }
  });

  it("uses drill-in for unknown exercise method", () => {
    const params = new URLSearchParams({ method: "narrow-reading" });
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
    expect(cardEngineSessionHref("form")).toBe(
      `${routes.wordsReview}?method=${CARD_ENGINE_METHOD_ID}&deck=form`,
    );
    expect(cardEngineSessionHref("meaning")).toBe(
      `${routes.wordsReview}?method=${CARD_ENGINE_METHOD_ID}&deck=meaning`,
    );
  });
});
