import type { CSSProperties } from "react";

import progression from "@/data/design-themes/progression.json";
import { themeScopeStyle, type BorderWeight, type DesignThemeTokens } from "@/lib/design-themes";

/**
 * The two-layer progression model. Contract:
 * docs/specs/page/progression-explorer.md
 *
 * **Chapter** is a full token set; **stage** is a decorative overlay on top of
 * it. Stages may also pick a material skin (CSS-only textures), radius, border
 * weight, and star count — never contrast-bearing colours.
 */

export const MIN_STAGE = 1;
export const MAX_STAGE = 9;

export type ProgressionSkinId =
  | "workshop-1"
  | "workshop-2"
  | "workshop-3"
  | "library-1"
  | "library-2"
  | "library-3"
  | "observatory-1"
  | "observatory-2"
  | "observatory-3";

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
  skin: ProgressionSkinId;
  glow: number;
  grain: number;
  bevel: number;
  rule: number;
  /** Stage-level card radius — decorative, not a contrast token. */
  radiusCard: string;
  borderPx: number;
  /** Glowing sky dots in Observatory only. */
  stars: number;
};

const data = progression as { chapters: ProgressionChapter[]; stages: ProgressionStage[] };

export const progressionChapters = data.chapters;
export const progressionStages = data.stages;

function required<T>(value: T | undefined, what: string): T {
  if (!value) {
    throw new Error(`data/design-themes/progression.json defines no ${what}`);
  }
  return value;
}

const FIRST_CHAPTER = required(progressionChapters[0], "chapters");
const FIRST_STAGE = required(progressionStages[0], "stages");

export function clampStage(stage: number): number {
  if (!Number.isFinite(stage)) return MIN_STAGE;
  return Math.min(MAX_STAGE, Math.max(MIN_STAGE, Math.round(stage)));
}

export function chapterForStage(stage: number): ProgressionChapter {
  const clamped = clampStage(stage);
  const found = progressionChapters.find(
    (chapter) => clamped >= chapter.stageFrom && clamped <= chapter.stageTo,
  );
  return found ?? FIRST_CHAPTER;
}

export function stageDetail(stage: number): ProgressionStage {
  const clamped = clampStage(stage);
  return progressionStages.find((entry) => entry.stage === clamped) ?? FIRST_STAGE;
}

export function crossesChapter(from: number, to: number): boolean {
  return chapterForStage(from).id !== chapterForStage(to).id;
}

export function stageSkinClass(skin: ProgressionSkinId): string {
  return `progression-skin--${skin}`;
}

export type StageScopeInput = {
  stage: number;
};

export function stageScopeStyle({ stage }: StageScopeInput): CSSProperties {
  const chapter = chapterForStage(stage);
  const detail = stageDetail(stage);

  return {
    ...themeScopeStyle(chapter.tokens),
    "--radius-card": detail.radiusCard,
    "--stage-glow": String(detail.glow),
    "--stage-grain": String(detail.grain),
    "--stage-bevel": `${detail.bevel}px`,
    "--stage-rule": String(detail.rule),
    "--stage-border-px": `${detail.borderPx}px`,
    "--stage-stars": String(detail.stars),
  } as CSSProperties;
}
