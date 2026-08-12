import { describe, expect, it } from "vitest";

import { loadLanguages } from "@/features/language-status/profiles";
import { labelledLanguages, languageLabel } from "@/lib/languages";

/**
 * The point of this file is the first test. The endonym is authored in
 * `data/languages/<code>.json`; `lib/languages.ts` repeats it so components can
 * read it without touching the filesystem. That duplication is only safe while
 * something checks it.
 */
describe("languageLabel", () => {
  it("agrees with the endonym in every shipped language profile", () => {
    const { profiles } = loadLanguages();
    expect(profiles.length).toBeGreaterThan(0);

    for (const profile of profiles) {
      expect(languageLabel(profile.code).endonym).toBe(profile.name);
    }
  });

  it("has a label for every shipped profile", () => {
    const { profiles } = loadLanguages();
    for (const profile of profiles) {
      expect(labelledLanguages()).toContain(profile.code);
    }
  });

  it("falls back to the code rather than throwing", () => {
    // A language added to the database before this map is a cosmetic problem;
    // a page that dies because of it is not.
    expect(languageLabel("zz")).toEqual({ endonym: "zz", english: "zz", flag: "🌐" });
  });
});
