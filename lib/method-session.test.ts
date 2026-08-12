import { globSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { routes } from "@/lib/routes";

import type { MethodEntry } from "@/lib/method-catalogue";
import {
  CARD_ENGINE_METHOD_ID,
  cardEngineSessionHref,
  cardHrefForMethod,
  sessionHrefForMethod,
  usesWordsReview,
} from "@/lib/method-session";

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

describe("cardHrefForMethod", () => {
  it("links srs-session to Words review", () => {
    expect(cardHrefForMethod(method({ id: "srs-session" }))).toBe(
      sessionHrefForMethod(method({ id: "srs-session" })),
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

describe("the card engine has one id", () => {
  it("is the only thing that opens a runner — no surface builds the href by hand", () => {
    // method-engines.md: "no code path may assume a session exists — only
    // usesWordsReview may open a runner". Three surfaces used to interpolate
    // `?method=srs-session` themselves, which put the id in five places and
    // made that criterion false the day it was written.
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
