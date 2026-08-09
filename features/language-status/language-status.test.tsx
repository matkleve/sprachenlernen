import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { afterAll, describe, expect, it } from "vitest";

import type { LanguageProfile } from "@/lib/lexicon";
import { expectNoA11yViolations } from "@/tests/axe";

import { LanguageStatus } from "./LanguageStatus";
import { copy, noNextTier, tierCopy } from "./content";
import { LANGUAGES_DIR, loadLanguages } from "./profiles";

/**
 * The named check for docs/specs/page/language-status.md.
 * Each test maps to one acceptance criterion in that spec — when a criterion
 * changes, this file changes in the same commit.
 */

const profile = (over: Partial<LanguageProfile> = {}): LanguageProfile => ({
  code: "es",
  name: "Español",
  script: "latin",
  morphology: "fusional",
  countingUnit: "lemma",
  frequency: {
    source: "hermitdave/FrequencyWords",
    corpus: "OpenSubtitles 2018",
    version: "2018",
    licence: "MIT",
    unit: "form",
    file: "data/frequency/es.txt",
  },
  lemmaTable: "data/lemma/es.json",
  calibration: null,
  voices: [],
  ...over,
});

const show = (profiles: LanguageProfile[], invalid: { file: string; errors: string[] }[] = []) =>
  render(<LanguageStatus profiles={profiles} invalid={invalid} />);

const occurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

/** The cell showing the derived tier is the second in a language's row. */
const tierShownFor = (name: string) => {
  const row = screen.getByRole("rowheader", { name }).closest("tr");
  return row?.querySelectorAll("td")[0]?.textContent;
};

const tmpRoots: string[] = [];
const fixtureRoot = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), "language-status-"));
  tmpRoots.push(root);
  mkdirSync(join(root, LANGUAGES_DIR), { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(join(root, LANGUAGES_DIR, name), body);
  }
  return root;
};

afterAll(() => {
  for (const root of tmpRoots) rmSync(root, { recursive: true, force: true });
});

describe("LanguageStatus", () => {
  it("lists each language exactly once, under the name from its profile", () => {
    const { container } = show([
      profile({ code: "es", name: "Español" }),
      profile({ code: "it", name: "Italiano" }),
    ]);

    expect(occurrences(container.textContent ?? "", "Español")).toBe(1);
    expect(occurrences(container.textContent ?? "", "Italiano")).toBe(1);
  });

  it("shows the frequency source and version read from the profile", () => {
    show([
      profile({
        frequency: { ...profile().frequency, source: "some/other-list", version: "2024" },
      }),
    ]);

    expect(screen.getByText("some/other-list")).toBeDefined();
    expect(screen.getByText(/version 2024/)).toBeDefined();
  });

  it("derives tier B from a lemma table with no dated calibration", () => {
    show([profile({ lemmaTable: "data/lemma/es.json", calibration: null })]);

    expect(tierShownFor("Español")).toBe("B");
  });

  it("derives tier C without a lemma table, and claims no level at all", () => {
    const { container } = show([profile({ lemmaTable: null })]);

    expect(tierShownFor("Español")).toBe("C");
    expect(container.textContent).toContain("no level is claimed");
  });

  it("derives tier A from a dated calibration, and names nothing as missing", () => {
    const { container } = show([
      profile({ lemmaTable: "data/lemma/es.json", calibration: { dated: "2026-08-09" } }),
    ]);

    expect(tierShownFor("Español")).toBe("A");
    expect(container.textContent).toContain(noNextTier);
    // The artefacts the lower tiers are waiting for must not appear for a
    // language that is not waiting for anything.
    expect(container.textContent).not.toContain(tierCopy.B.nextTier);
    expect(container.textContent).not.toContain(tierCopy.C.nextTier);
  });

  it("ignores a hand-written tier and shows the derived one", () => {
    // A tier someone can type is not a quality statement — UC-036. This fails
    // the moment anyone reads the field instead of deriving it.
    const lying = { ...profile({ lemmaTable: null }), qualityTier: "A" } as LanguageProfile;
    show([lying]);

    expect(tierShownFor("Español")).toBe("C");
  });

  it("says once what the tier claims and once what it does not", () => {
    const { container } = show([profile()]);
    const text = container.textContent ?? "";

    expect(occurrences(text, tierCopy.B.claims)).toBe(1);
    expect(occurrences(text, tierCopy.B.notClaims)).toBe(1);
  });

  it("lists a refused profile by file and reason instead of dropping it", () => {
    const { container } = show(
      [profile()],
      [{ file: "de.json", errors: ["script: required", "frequency: required object"] }],
    );

    expect(screen.getByText("de.json")).toBeDefined();
    expect(container.textContent).toContain("script: required");
    expect(container.textContent).toContain("frequency: required object");
  });

  it("shows the empty line and no language table when nothing loaded", () => {
    const { container } = show([]);

    expect(screen.getByText(copy.empty)).toBeDefined();
    expect(container.querySelector("table")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = show(
      [profile({ code: "es", name: "Español" }), profile({ code: "it", name: "Italiano" })],
      [{ file: "de.json", errors: ["script: required"] }],
    );

    await expectNoA11yViolations(container);
  });
});

describe("loadLanguages", () => {
  it("loads every profile the repository ships, with none refused", () => {
    const { profiles, invalid } = loadLanguages();

    expect(invalid).toEqual([]);
    expect(profiles.map((p) => p.code).sort()).toEqual(["es", "it"]);
  });

  it("refuses a malformed profile by name rather than skipping it", () => {
    const root = fixtureRoot({
      "good.json": JSON.stringify(profile({ code: "es", name: "Español" })),
      "broken.json": JSON.stringify({ code: "xx", name: "Broken" }),
      "unparseable.json": "{ not json",
    });

    const { profiles, invalid } = loadLanguages(root);

    expect(profiles.map((p) => p.code)).toEqual(["es"]);
    expect(invalid.map((i) => i.file).sort()).toEqual(["broken.json", "unparseable.json"]);
    expect(invalid.find((i) => i.file === "broken.json")?.errors.join(" ")).toContain("script");
  });

  it("treats a missing directory as empty rather than throwing", () => {
    expect(loadLanguages(join(tmpdir(), "language-status-does-not-exist"))).toEqual({
      profiles: [],
      invalid: [],
    });
  });

  it("orders languages by the name the reader sees", () => {
    const root = fixtureRoot({
      "zz.json": JSON.stringify(profile({ code: "zz", name: "Aaaa" })),
      "aa.json": JSON.stringify(profile({ code: "aa", name: "Zzzz" })),
    });

    expect(loadLanguages(root).profiles.map((p) => p.name)).toEqual(["Aaaa", "Zzzz"]);
  });
});

describe("the surface stays a Server Component", () => {
  it('has no "use client" anywhere the route can reach', () => {
    // AGENTS.md boundary 5. This page holds no state and needs no handler, so
    // the directive would be pure cost — and it is the kind of line that gets
    // added reflexively while debugging and then never removed.
    const files = [
      "app/(marketing)/languages/page.tsx",
      "features/language-status/LanguageStatus.tsx",
      "features/language-status/content.ts",
      "features/language-status/profiles.ts",
    ];

    for (const file of files) {
      expect(readFileSync(join(process.cwd(), file), "utf8")).not.toContain("use client");
    }
  });
});
