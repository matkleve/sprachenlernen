/** Contract: docs/specs/feature/exercise-runner.md */
import { describe, expect, it } from "vitest";

import {
  createRunnerState,
  setStepCheck,
  summariseSessionFindings,
} from "@/lib/exercise-runner";
import type { ExerciseRecipe, ExerciseRunnerState } from "@/lib/exercise-runner/types";
import type { SentenceCheckResult, SentenceFinding } from "@/lib/sentence-check";

const recipe: ExerciseRecipe = {
  methodId: "build-a-sentence",
  steps: [
    { id: "w1", type: "do", component: "sentence-check", config: { word: "casa", lemma: "casa" } },
    { id: "w2", type: "do", component: "sentence-check", config: { word: "perro", lemma: "perro" } },
    { id: "w3", type: "do", component: "sentence-check", config: { word: "libro", lemma: "libro" } },
    { id: "d1", type: "decide", component: "summary", config: {} },
  ],
};

function spans(text: string) {
  return [...text.matchAll(/\p{L}+/gu)].map((m) => ({
    text: m[0],
    start: m.index,
    end: m.index + m[0].length,
  }));
}

function withCheck(
  state: ExerciseRunnerState,
  stepId: string,
  result: SentenceCheckResult,
): ExerciseRunnerState {
  return setStepCheck(state, stepId, { phase: "checked", result });
}

const clean: SentenceCheckResult = {
  status: "checked",
  text: "Mi casa es grande",
  tokens: spans("Mi casa es grande"),
  findings: [],
};

function withFindings(text: string, findings: SentenceFinding[]): SentenceCheckResult {
  return { status: "checked", text, tokens: spans(text), findings };
}

describe("summariseSessionFindings", () => {
  it("reports nothing for a session where no check ran", () => {
    expect(summariseSessionFindings(createRunnerState(recipe))).toEqual({
      checked: 0,
      clean: 0,
      unavailable: 0,
      byCategory: [],
      words: [],
    });
  });

  it("counts clean sentences apart from flagged ones", () => {
    let state = createRunnerState(recipe);
    state = withCheck(state, "w1", clean);
    state = withCheck(
      state,
      "w2",
      withFindings("el perro", [
        {
          tokenIndex: 0,
          category: "agreement",
          messageKey: "agreementGender",
          messageValues: {},
        },
      ]),
    );

    const summary = summariseSessionFindings(state);
    expect(summary.checked).toBe(2);
    expect(summary.clean).toBe(1);
    expect(summary.byCategory).toEqual([{ category: "agreement", count: 1 }]);
    expect(summary.words).toEqual(["el"]);
  });

  it("ranks categories by how often they came up", () => {
    let state = createRunnerState(recipe);
    state = withCheck(
      state,
      "w1",
      withFindings("el casa grandee", [
        { tokenIndex: 0, category: "agreement", messageKey: "agreementGender", messageValues: {} },
        { tokenIndex: 2, category: "spelling", messageKey: "spellingUnknown", messageValues: {} },
      ]),
    );
    state = withCheck(
      state,
      "w2",
      withFindings("las perro", [
        { tokenIndex: 0, category: "agreement", messageKey: "agreementNumber", messageValues: {} },
      ]),
    );

    expect(summariseSessionFindings(state).byCategory).toEqual([
      { category: "agreement", count: 2 },
      { category: "spelling", count: 1 },
    ]);
  });

  it("counts the same slip in two sentences as one word to work on", () => {
    let state = createRunnerState(recipe);
    const finding = {
      tokenIndex: 0,
      category: "agreement" as const,
      messageKey: "agreementGender",
      messageValues: {},
    };
    state = withCheck(state, "w1", withFindings("El casa", [finding]));
    state = withCheck(state, "w2", withFindings("el perro", [finding]));

    expect(summariseSessionFindings(state).words).toEqual(["El"]);
  });

  it("keeps a check that could not run out of the clean count", () => {
    let state = createRunnerState(recipe);
    state = withCheck(state, "w1", { status: "unavailable", reason: "no-lexicon" });

    const summary = summariseSessionFindings(state);
    expect(summary).toMatchObject({ checked: 0, clean: 0, unavailable: 1 });
  });

  it("ignores a sentence-level finding that names no token", () => {
    let state = createRunnerState(recipe);
    state = withCheck(
      state,
      "w1",
      withFindings("Mi perro", [
        {
          tokenIndex: -1,
          category: "missing-target",
          messageKey: "missingTarget",
          messageValues: { word: "casa" },
        },
      ]),
    );

    const summary = summariseSessionFindings(state);
    expect(summary.byCategory).toEqual([{ category: "missing-target", count: 1 }]);
    expect(summary.words).toEqual([]);
  });
});
