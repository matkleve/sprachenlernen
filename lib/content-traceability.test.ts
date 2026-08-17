/**
 * Contract: docs/specs/feature/content-traceability.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildContentTraceIndex,
  wordTraceForLemma,
} from "@/lib/content-traceability";
import { loadSources } from "@/lib/coverage";
import {
  buildLexicon,
  loadLemmaTable,
  loadProfile,
  parseFrequencyList,
} from "@/lib/lexicon";

const ROOT = join(__dirname, "..");
const readData = (path: string) => readFileSync(join(ROOT, path), "utf8");

const esLexicon = () => {
  const profile = loadProfile(JSON.parse(readData("data/languages/es.json"))).profile!;
  const table = loadLemmaTable(JSON.parse(readData("data/lemma/es.json")), "es").table!;
  return buildLexicon(profile, parseFrequencyList(readData("data/frequency/es.txt")), table);
};

describe("content-traceability", () => {
  it("links a lemma to fixture and catalogue source titles", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const index = buildContentTraceIndex(sources, esLexicon());
    expect(index).not.toBeNull();

    const trace = wordTraceForLemma("uno", index!);
    expect(trace.kind).toBe("appearances");
    if (trace.kind !== "appearances") return;

    expect(trace.appearanceCount).toBe(2);
    expect(trace.topSources.map((source) => source.title)).toEqual([
      "Noticias: elecciones en Chile",
      "En el café",
    ]);
    expect(trace.topSources[0]?.id).toBe("es-catalogue-chile");
    expect(trace.topSources[1]?.id).toBe("es-fixture-cafe");
  });

  it("returns an empty view when the lemma is not in any persisted source", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const index = buildContentTraceIndex(sources, esLexicon())!;

    expect(wordTraceForLemma("zzzzz", index)).toEqual({ kind: "empty" });
  });

  it("ignores ephemeral sources when building the index", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const ephemeral = {
      ...sources[0]!,
      id: "es-ephemeral",
      title: "Session paste",
      ephemeral: true,
    };
    const index = buildContentTraceIndex([...sources, ephemeral], esLexicon())!;

    const casaTrace = wordTraceForLemma("casa", index);
    expect(casaTrace.kind).toBe("appearances");
    if (casaTrace.kind === "appearances") {
      expect(casaTrace.topSources.some((source) => source.id === "es-ephemeral")).toBe(false);
    }
  });

  it("returns null when no persisted sources exist", () => {
    const { sources } = loadSources(JSON.parse(readData("data/content/es.json")));
    const ephemeralOnly = sources.map((source) => ({ ...source, ephemeral: true }));

    expect(buildContentTraceIndex(ephemeralOnly, esLexicon())).toBeNull();
  });
});
