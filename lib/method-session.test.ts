import { describe, expect, it } from "vitest";

import type { MethodEntry } from "@/lib/method-catalogue";
import {
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
