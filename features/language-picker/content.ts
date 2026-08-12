/**
 * Copy for the language picker. Contract: docs/specs/page/language-picker.md
 *
 * Three rules this file carries, all of which someone will eventually try to
 * "improve" — the reasons are in the spec:
 *   1. never the word "lemma" (GLOSSARY gives it no user-facing form);
 *   2. always name the denominator ("starter set"), because a bare "of 500"
 *      reads as a finish line;
 *   3. zero is a measurement, so `0 of 500` is a real line, not an empty state.
 */

export const copy = {
  title: "Which language do you want to learn?",
  intro: "You can add another later. Nothing here locks you in.",

  notStarted: (poolSize: number) => `${poolSize} words in the starter set`,
  held: (held: number, poolSize: number) =>
    `${held} of ${poolSize} starter words held stably`,
  unavailable: (name: string) =>
    `Not available yet — we don't have a word set for ${name} we'd stand behind`,

  alreadyLearning: "Already learning",
  active: "Active",
  choose: "Start with this language",

  footnote:
    "These counts are about the starter set only. Nothing here is a claim about the language as a whole.",

  error: "Could not add that language.",
} as const;
