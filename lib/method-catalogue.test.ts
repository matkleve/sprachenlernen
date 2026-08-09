import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SECTIONS,
  commitments,
  filterByContext,
  isMethod,
  loadCatalogue,
  loadPresets,
  matchesContext,
  type Catalogue,
  type Context,
  type MethodEntry,
  type Preset,
} from "@/lib/method-catalogue";

const ROOT = join(import.meta.dirname, "..");
const readData = (path: string) => JSON.parse(readFileSync(join(ROOT, path), "utf8")) as unknown;

const FILES = SECTIONS.map((section) => readData(`data/methods/${section}.json`));

const shipped = (): Catalogue => {
  const { catalogue, errors } = loadCatalogue(FILES);
  if (!catalogue) throw new Error(errors.join("\n"));
  return catalogue;
};

const presets = (): Preset[] => {
  const { presets: loaded, errors } = loadPresets(readData("data/methods/presets.json"));
  if (!loaded) throw new Error(errors.join("\n"));
  return loaded;
};

const aMethod = (over: Partial<MethodEntry> = {}) => ({
  id: "a-method",
  name: "A method",
  type: "method",
  trains: "something",
  skills: ["reading"],
  targetSignal: "lexicalCoverage",
  evidence: "B",
  demanding: false,
  hosted: true,
  intensity: 2,
  durations: [10],
  requires: { eyes: ["free"] },
  offerEveryDays: null,
  doesNotDo: "Not everything.",
  ...over,
});

const aCommitment = (over: Record<string, unknown> = {}) => ({
  id: "a-commitment",
  name: "A commitment",
  type: "commitment",
  trains: "something",
  skills: [],
  targetSignal: null,
  evidence: "D",
  demanding: false,
  hosted: false,
  intensity: null,
  durations: null,
  requires: {},
  offerEveryDays: null,
  reviewAfterDays: 28,
  doesNotDo: "Not everything.",
  ...over,
});

const file = (entries: unknown[], section = "reading") => [{ section, entries }];

describe("the shipped catalogue", () => {
  it("loads every section file without an error", () => {
    expect(loadCatalogue(FILES).errors).toEqual([]);
  });

  it("loads every preset without an error", () => {
    expect(loadPresets(readData("data/methods/presets.json")).errors).toEqual([]);
  });

  it("covers all eight sections", () => {
    const sections = new Set(shipped().entries.map((entry) => entry.section));
    expect([...sections].sort()).toEqual([...SECTIONS].sort());
  });

  it("says what every entry does not do", () => {
    // study/12: the info page's honest half is mandatory, not a nicety. An
    // entry without it reads as a recommendation.
    for (const entry of shipped().entries) {
      expect(entry.doesNotDo.length, entry.id).toBeGreaterThan(20);
    }
  });

  it("keeps about half the catalogue outside the app", () => {
    // study/12, thesis 9. If this ever trends towards 1, the vocabulary pull
    // has won and the catalogue has quietly become the app's feature list.
    const entries = shipped().entries;
    const hosted = entries.filter((entry) => entry.hosted).length;
    expect(hosted / entries.length).toBeLessThan(0.75);
  });

  it("carries a floor on exactly the five methods study/12 gives one", () => {
    const withFloor = shipped()
      .entries.filter(isMethod)
      .filter((entry) => entry.offerEveryDays !== null)
      .map((entry) => [entry.id, entry.offerEveryDays] as const)
      .sort();

    expect(withFloor).toEqual([
      ["extensive-reading", 3.5],
      ["free-production", 7],
      ["full-dictation", 10],
      ["listening-level-1", 3.5],
      ["srs-session", 1],
    ]);
  });

  it("includes the weak methods rather than hiding them", () => {
    // study/21, point 5: omitting what learners ask about only produces the
    // question again.
    const grades = new Set(shipped().entries.map((entry) => entry.evidence));
    expect(grades).toContain("D");
  });
});

describe("what the validator refuses to admit", () => {
  it("a method with no context requirements", () => {
    const { errors } = loadCatalogue(file([aMethod({ requires: {} })]));
    expect(errors.join()).toContain("no context requirements");
  });

  it("a method requiring a dimension that does not exist", () => {
    const { errors } = loadCatalogue(file([aMethod({ requires: { mood: ["good"] } as never })]));
    expect(errors.join()).toContain("not a context dimension");
  });

  it("a method requiring a value that dimension does not have", () => {
    const { errors } = loadCatalogue(file([aMethod({ requires: { eyes: ["shut"] } as never })]));
    expect(errors.join()).toContain("is not one of");
  });

  it("a commitment carrying a duration", () => {
    const { errors } = loadCatalogue(file([aCommitment({ durations: [10] })], "commitments"));
    expect(errors.join()).toContain("must be null on a commitment");
  });

  it("a commitment carrying a context", () => {
    const entries = [aCommitment({ requires: { eyes: ["free"] } })];
    const { errors } = loadCatalogue(file(entries, "commitments"));
    expect(errors.join()).toContain("it is not a session");
  });

  it("an entry with no honest limitation", () => {
    const { errors } = loadCatalogue(file([aMethod({ doesNotDo: "" })]));
    expect(errors.join()).toContain("doesNotDo");
  });

  it("two entries with the same id", () => {
    const { errors } = loadCatalogue(file([aMethod(), aMethod()]));
    expect(errors.join()).toContain("already used");
  });

  it("a target signal that is not one of the seven", () => {
    const { errors } = loadCatalogue(file([aMethod({ targetSignal: "vibes" as never })]));
    expect(errors.join()).toContain("targetSignal");
  });

  it("durations that are not ascending", () => {
    const { errors } = loadCatalogue(file([aMethod({ durations: [20, 10] })]));
    expect(errors.join()).toContain("ascending");
  });

  it("but reports every problem at once rather than the first", () => {
    const { errors } = loadCatalogue(file([aMethod({ id: "", evidence: "Z" as never })]));
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe("filtering by context", () => {
  const contextOf = (id: string): Context => {
    const preset = presets().find((entry) => entry.id === id);
    if (!preset) throw new Error(`no preset ${id}`);
    return preset.context;
  };

  it("offers something in every preset, including the kitchen", () => {
    // study/21: an app that only knows touch exercises has nothing for the most
    // productive forty-five minutes of the day.
    for (const preset of presets()) {
      expect(filterByContext(shipped(), preset.context).length, preset.id).toBeGreaterThan(0);
    }
  });

  it("drops eyes-free methods when the eyes are busy", () => {
    const ids = filterByContext(shipped(), contextOf("kitchen")).map((entry) => entry.id);
    expect(ids).not.toContain("reading-aloud");
    expect(ids).toContain("shadowing");
  });

  it("drops everything longer than the budget", () => {
    const ids = filterByContext(shipped(), contextOf("waiting")).map((entry) => entry.id);
    expect(ids).toContain("srs-session");
    expect(ids).not.toContain("full-dictation");
  });

  it("offers open-ended methods only in an open block", () => {
    const open = filterByContext(shipped(), contextOf("desk")).map((entry) => entry.id);
    const bounded = filterByContext(shipped(), contextOf("bed")).map((entry) => entry.id);
    expect(open).toContain("book-you-know");
    expect(bounded).not.toContain("book-you-know");
  });

  it("never returns a commitment, because a standing rule has no context", () => {
    for (const preset of presets()) {
      const returned = filterByContext(shipped(), preset.context);
      expect(returned.every(isMethod)).toBe(true);
    }
    expect(commitments(shipped()).length).toBeGreaterThan(0);
  });

  it("opens a part of the catalogue only when there are people with you", () => {
    // study/21: company is a switch you turn on, not a standard question.
    const alone = contextOf("desk");
    const withPeople: Context = { ...alone, company: "speakers" };
    const gained = filterByContext(shipped(), withPeople)
      .map((entry) => entry.id)
      .filter((id) => !filterByContext(shipped(), alone).some((entry) => entry.id === id));

    expect(gained).toContain("tandem-or-language-cafe");
  });

  it("is a hard filter — a method that does not fit is absent, not demoted", () => {
    const entry = shipped().entries.filter(isMethod).find((e) => e.id === "full-dictation");
    expect(entry && matchesContext(entry, contextOf("walking"))).toBe(false);
  });
});
