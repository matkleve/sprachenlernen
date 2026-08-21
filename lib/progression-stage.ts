import type { CSSProperties } from "react";

import progression from "@/data/design-themes/progression.json";
import { themeScopeStyle, type BorderWeight, type DesignThemeTokens } from "@/lib/design-themes";

/**
 * The two-layer progression model. Contract:
 * docs/specs/page/progression-explorer.md
 *
 * **Chapter** is a full token set; **stage** is a decorative overlay on top of
 * it. They are separate because they cost differently: a chapter needs a
 * contrast review, a stage cannot need one — it is restricted to properties
 * that never carry text (glow, grain, bevel, rule, lamps).
 *
 * That restriction is the load-bearing part. Let a stage move `ink` or
 * `canvas` and every stage becomes a palette to validate: six goes to sixteen,
 * and the reason to have stages at all — that they are nearly free — is gone.
 */

export const MIN_STAGE = 1;
export const MAX_STAGE = 8;

export type ProgressionChapter = {
  id: string;
  name: string;
  tagline: string;
  stageFrom: number;
  stageTo: number;
  fontLabel: string;
  borderWeight: BorderWeight;
  tokens: DesignThemeTokens;
};

export type ProgressionStage = {
  stage: number;
  label: string;
  /** Fixed installations — biography. Never decreases with the stage. */
  lamps: number;
  glow: number;
  grain: number;
  bevel: number;
  rule: number;
};

const data = progression as { chapters: ProgressionChapter[]; stages: ProgressionStage[] };

export const progressionChapters = data.chapters;
export const progressionStages = data.stages;

// Constitution §4 — no silent failure. If the data file is ever emptied, that
// is a broken build, not a page that renders in the wrong colours.
function required<T>(value: T | undefined, what: string): T {
  if (!value) {
    throw new Error(`data/design-themes/progression.json defines no ${what}`);
  }
  return value;
}

const FIRST_CHAPTER = required(progressionChapters[0], "chapters");
const FIRST_STAGE = required(progressionStages[0], "stages");

/** Clamps rather than throws — a slider is the only caller and it cannot ask twice. */
export function clampStage(stage: number): number {
  if (!Number.isFinite(stage)) return MIN_STAGE;
  return Math.min(MAX_STAGE, Math.max(MIN_STAGE, Math.round(stage)));
}

export function chapterForStage(stage: number): ProgressionChapter {
  const clamped = clampStage(stage);
  const found = progressionChapters.find(
    (chapter) => clamped >= chapter.stageFrom && clamped <= chapter.stageTo,
  );
  // The data covers 1–8 with no gaps; this fallback means a future edit that
  // breaks that shows the wrong chapter rather than crashing the page.
  return found ?? FIRST_CHAPTER;
}

export function stageDetail(stage: number): ProgressionStage {
  const clamped = clampStage(stage);
  return progressionStages.find((entry) => entry.stage === clamped) ?? FIRST_STAGE;
}

/** True when moving between these two stages also changes the chapter. */
export function crossesChapter(from: number, to: number): boolean {
  return chapterForStage(from).id !== chapterForStage(to).id;
}

/**
 * How much a room dims when nobody has been there. Applies to *light*, never to
 * structure: the lamps a learner installed stay installed, they are simply off.
 * Coming back turns them on again, which is a welcome rather than a punishment.
 */
const UNLIT_GLOW_FACTOR = 0.15;
const UNLIT_LAMP_OPACITY = 0.25;

export type StageScopeInput = {
  stage: number;
  /** Whether the learner has been here recently. Structure ignores this. */
  lit: boolean;
};

/**
 * The chapter's tokens plus the stage's decorative variables, as one style
 * object for a scoping element — the same technique `/dev/design` uses.
 */
export function stageScopeStyle({ stage, lit }: StageScopeInput): CSSProperties {
  const chapter = chapterForStage(stage);
  const detail = stageDetail(stage);

  return {
    ...themeScopeStyle(chapter.tokens),
    "--stage-glow": String(lit ? detail.glow : detail.glow * UNLIT_GLOW_FACTOR),
    "--stage-grain": String(detail.grain),
    "--stage-bevel": `${detail.bevel}px`,
    "--stage-rule": String(detail.rule),
    "--stage-lamp-opacity": String(lit ? 1 : UNLIT_LAMP_OPACITY),
  } as CSSProperties;
}

/** Lamp count is biography — it never depends on `lit`. */
export function lampCount(stage: number): number {
  return stageDetail(stage).lamps;
}
