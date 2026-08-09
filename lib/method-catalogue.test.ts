import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SECTIONS,
  byId,
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

  it("keeps a third of the catalogue outside the app, and is watched for drifting up", () => {
    // study/12, thesis 9 says "about half". The shipped catalogue is 34%, so
    // the thesis is not met — recorded in the spec rather than papered over.
    // The bound is tight against today's value so that adding hosted methods
    // without adding off-app ones fails here instead of being noticed in a year.
    const entries = shipped().entries;
    const hosted = entries.filter((entry) => entry.hosted).length;
    expect(hosted / entries.length).toBeLessThanOrEqual(0.67);
  });

  it("carries the evidence grades the study gives, including the awkward ones", () => {
    // Nothing else pins a grade, and the grade is normative for menu ranking:
    // one hand-raised letter promotes an entry over fifty that have a source.
    const grade = (id: string) => byId(shipped(), id)?.evidence;

    // study/21 marks this "C, weak" — the chapter's own honesty test case.
    expect(grade("background-listening")).toBe("C");
    // study/21 marks it "B/C"; the schema admits one grade, so it is the lower.
    expect(grade("write-and-perform-a-play")).toBe("C");
    // No row in study/21 at all; graded from study/06, whose mark is [B].
    expect(grade("free-production")).toBe("B");
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

  it("a method claiming the commitment review", () => {
    const { errors } = loadCatalogue(file([aMethod({ reviewAfterDays: 28 } as never)]));
    expect(errors.join()).toContain("a method is not reviewed");
  });

  it("an empty list of requirement alternatives", () => {
    const { errors } = loadCatalogue(file([aMethod({ requires: [] })]));
    expect(errors.join()).toContain("no context requirements");
  });

  it("two files declaring the same section", () => {
    const { errors } = loadCatalogue([...file([aMethod()]), ...file([aMethod({ id: "other" })])]);
    expect(errors.join()).toContain("already declared");
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
    // extensive-reading, not reading-aloud: study/21 gives this one "eyes free"
    // and reading-aloud only "voice free". Illustrating a chapter rule with an
    // authored requirement makes the test agree with the data by construction.
    expect(ids).not.toContain("extensive-reading");
    expect(ids).toContain("shadowing");
  });

  it("drops everything longer than the budget, and nothing else", () => {
    // Isolated deliberately. An earlier version compared two entries that were
    // also separated by surface and attention, so deleting the budget
    // comparison from fitsTime changed no assertion in the suite — the first of
    // study/21's four separating questions was untested.
    const block = byId(shipped(), "close-a-frequency-block");
    if (!block || !isMethod(block)) throw new Error("missing entry");
    expect(block.durations).toEqual([10, 20]);

    const base = contextOf("transit");
    expect(matchesContext(block, { ...base, time: "45" })).toBe(true);
    expect(matchesContext(block, { ...base, time: "15" })).toBe(true);
    expect(matchesContext(block, { ...base, time: "2" })).toBe(false);
  });

  it("accepts a method that can be done one way or another", () => {
    // The SRS session is "touch or voice" in study/21. Expressed as one set it
    // loses the voice half and the only daily floor becomes unofferable in four
    // presets — a floor the learner cannot act on is worse than none.
    const ids = (preset: string) =>
      filterByContext(shipped(), contextOf(preset)).map((entry) => entry.id);

    expect(ids("transit")).toContain("srs-session");
    expect(ids("kitchen")).toContain("srs-session");
  });

  it("offers the daily floor in most contexts, and names the ones it cannot", () => {
    const without = presets()
      .filter(
        (preset) =>
          !filterByContext(shipped(), preset.context).some((entry) => entry.id === "srs-session"),
      )
      .map((preset) => preset.id);

    // In bed the preset is "nothing to write on" and "quiet" — study/21's own
    // values, and between them they exclude both halves of "touch or voice".
    expect(without).toEqual(["bed"]);
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

  it("ships the seven presets of study/21, with the kitchen read correctly", () => {
    // Nothing else asserts a preset value, so the kitchen could quietly become
    // eyes-free and the whole suite would still pass — which would delete the
    // one context the chapter singles out as the hard case.
    expect(presets().map((preset) => preset.id)).toEqual([
      "desk",
      "walking",
      "transit",
      "computer",
      "bed",
      "waiting",
      "kitchen",
    ]);

    expect(contextOf("kitchen")).toMatchObject({
      eyes: "occupied",
      hands: "none",
      voice: "aloud",
      writingSurface: "none",
      time: "45",
    });
    expect(contextOf("waiting")).toMatchObject({ attention: "fragmented", time: "2" });
  });

  it("names every entry no preset can reach, rather than letting the list grow", () => {
    const reachable = new Set(
      presets().flatMap((preset) =>
        ["alone", "speakers", "others"].flatMap((company) =>
          filterByContext(shipped(), { ...preset.context, company: company as never }).map(
            (entry) => entry.id,
          ),
        ),
      ),
    );

    const unreachable = shipped()
      .entries.filter(isMethod)
      .map((entry) => entry.id)
      .filter((id) => !reachable.has(id))
      .sort();

    // Not a passing grade — a pinned defect. It needs an open-time keyboard
    // preset, which study/21's seven do not include: "At the computer" is
    // fifteen minutes and "At the desk" is paper. Recorded in the spec.
    expect(unreachable).toEqual(["translate-a-song"]);
  });

  it("cannot offer the kitchen method in the kitchen — pinned, not accepted", () => {
    // study/21 gives cooking from a recipe the context "kitchen" and defines
    // the kitchen preset as eyes and hands gone. Reading a recipe needs eyes.
    // The chapter contradicts itself; resolving it either way here would be
    // inventing a rule, so the contradiction is pinned and left to a decision.
    const ids = filterByContext(shipped(), contextOf("kitchen")).map((entry) => entry.id);
    expect(ids).not.toContain("cook-from-a-recipe");
  });

  it("is a hard filter — a method that does not fit is absent, not demoted", () => {
    const entry = shipped().entries.filter(isMethod).find((e) => e.id === "full-dictation");
    expect(entry && matchesContext(entry, contextOf("walking"))).toBe(false);
  });
});
