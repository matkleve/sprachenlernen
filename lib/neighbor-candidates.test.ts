import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildNeighborCandidateIndex,
  levenshteinDistance,
  neighborCandidatesForLemma,
} from "@/lib/neighbor-candidates";

describe("neighbor-candidates", () => {
  it("finds pero/perro at distance 1", () => {
    const pool = ["pero", "perro", "casa"];
    expect(neighborCandidatesForLemma("pero", pool, { tightened: false })).toEqual(["perro"]);
    expect(neighborCandidatesForLemma("perro", pool, { tightened: false })).toEqual(["pero"]);
  });

  it("ignores distance 2 pairs", () => {
    const pool = ["mesa", "muse"];
    expect(neighborCandidatesForLemma("mesa", pool, { tightened: false })).toEqual([]);
  });

  it("ignores lemmas outside the length window", () => {
    const pool = ["el", "ella", "pero", "perro"];
    expect(neighborCandidatesForLemma("el", pool, { tightened: false })).toEqual([]);
    expect(neighborCandidatesForLemma("pero", pool, { tightened: false })).toEqual(["perro"]);
  });

  it("computes levenshtein distance for edits", () => {
    expect(levenshteinDistance("pero", "perro")).toBe(1);
    expect(levenshteinDistance("abc", "axy")).toBe(2);
  });

  it("builds symmetric wordId keys", () => {
    const index = buildNeighborCandidateIndex("es", ["pero", "perro", "de"]);
    expect(index.candidates["es:pero"]).toEqual(["perro"]);
    expect(index.candidates["es:perro"]).toEqual(["pero"]);
  });

  it("matches committed Spanish sidecar", () => {
    const pool = JSON.parse(readFileSync("data/starter/es-meaning-recall.json", "utf8"));
    const committed = JSON.parse(readFileSync("data/starter/es-neighbor-candidates.json", "utf8"));
    const expected = buildNeighborCandidateIndex(
      "es",
      pool.cards.map((card: { lemma: string }) => card.lemma),
    );
    expect(committed).toEqual(expected);
    expect(committed.candidates["es:pero"]).toContain("perro");
    expect(committed.candidates["es:perro"]).toContain("pero");
  });
});
