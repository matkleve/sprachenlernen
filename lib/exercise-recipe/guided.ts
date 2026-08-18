/**
 * Thin guided-session recipes — off-screen work + confirm-done + debrief.
 * Contract: docs/specs/service/method-guided-sessions.md
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { SessionContext } from "@/lib/exercise-recipe/types";
import type { ExerciseRecipe, ExerciseStep } from "@/lib/exercise-runner/types";
import { loadCatalogue, SECTIONS, type MethodEntry } from "@/lib/method-catalogue";

import {
  type GuidedMethodId,
  isGuidedMethodId,
} from "@/lib/exercise-recipe/guided-ids";

export { GUIDED_METHOD_IDS, isGuidedMethodId } from "@/lib/exercise-recipe/guided-ids";
export type { GuidedMethodId } from "@/lib/exercise-recipe/guided-ids";

type GuidedTemplate = {
  sheetDownload?: boolean;
  speakPrompt?: boolean;
  /** Minutes from catalogue when omitted. */
  waitMinutes?: number | null;
  terminal: "debrief" | "summary" | "offers";
};

const TEMPLATES: Partial<Record<GuidedMethodId, GuidedTemplate>> = {
  "book-you-know": { waitMinutes: null, terminal: "debrief" },
  "background-listening": { waitMinutes: null, terminal: "summary" },
  "self-talk": { terminal: "debrief" },
  "voice-message": { speakPrompt: true, waitMinutes: null, terminal: "debrief" },
  "role-play": { sheetDownload: true, waitMinutes: null, terminal: "debrief" },
  "singing-along": { waitMinutes: null, terminal: "summary" },
  "interpreting": { waitMinutes: null, terminal: "debrief" },
  "translate-a-song": { terminal: "debrief" },
  "write-and-perform-a-play": { waitMinutes: null, terminal: "debrief" },
  "mine-your-own-sentences": { terminal: "offers" },
  "handwriting-shakiest": { sheetDownload: true, waitMinutes: null, terminal: "offers" },
  "cook-from-a-recipe": { sheetDownload: true, waitMinutes: null, terminal: "debrief" },
  "video-game-in-target-language": { waitMinutes: null, terminal: "summary" },
  "tandem-or-language-cafe": { terminal: "debrief" },
  "order-ask-complain": { waitMinutes: null, terminal: "debrief" },
  "film-you-know-by-heart": { waitMinutes: null, terminal: "summary" },
};

function loadMethodEntry(methodId: string): MethodEntry | null {
  const root = process.cwd();
  const inputs: unknown[] = [];
  for (const section of SECTIONS) {
    try {
      const raw = readFileSync(join(root, "data/methods", `${section}.json`), "utf8");
      inputs.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }
  const { catalogue } = loadCatalogue(inputs);
  if (!catalogue) return null;
  const found = catalogue.entries.find((e) => e.id === methodId);
  if (!found || found.type !== "method") return null;
  return found;
}

function waitDurationSec(entry: MethodEntry, template: GuidedTemplate): number | undefined {
  if (template.waitMinutes === null) return undefined;
  const minutes =
    template.waitMinutes ??
    (entry.durations && entry.durations.length > 0 ? entry.durations[0] : undefined);
  if (minutes === undefined || minutes === null) return undefined;
  return minutes * 60;
}

function instructionStep(entry: MethodEntry): ExerciseStep {
  return {
    id: "prepare-instruction",
    type: "prepare",
    component: "prompt",
    label: "How this works",
    config: {
      body: `${entry.summary}\n\n${entry.trains}`,
    },
  };
}

function buildGuidedRecipe(entry: MethodEntry): ExerciseRecipe {
  const template = TEMPLATES[entry.id as GuidedMethodId] ?? { terminal: "debrief" };
  const steps: ExerciseStep[] = [instructionStep(entry)];

  if (template.sheetDownload) {
    steps.push({
      id: "prepare-sheet",
      type: "prepare",
      component: "sheet-download",
      label: "Worksheet",
      config: {
        title: entry.name,
        lines: 8,
      },
    });
  }

  if (template.speakPrompt) {
    steps.push({
      id: "do-speak",
      type: "do",
      component: "speak-prompt",
      label: "Speak",
      config: {
        body: entry.trains,
      },
    });
  }

  const durationSec = waitDurationSec(entry, template);
  if (durationSec !== undefined || template.waitMinutes === null || template.waitMinutes === undefined) {
    steps.push({
      id: "wait-offscreen",
      type: "wait",
      label: "Off-screen",
      config: durationSec !== undefined ? { durationSec } : {},
    });
  }

  steps.push({
    id: "submit-confirm",
    type: "submit",
    component: "confirm-done",
    label: "Confirm",
    config: {
      required: false,
    },
  });

  if (template.terminal === "summary") {
    steps.push({
      id: "decide-summary",
      type: "decide",
      component: "summary",
      label: "Done",
      config: {
        body: "You guided the attempt honestly. Nothing here grades the real-world work.",
      },
    });
  } else if (template.terminal === "offers") {
    steps.push({
      id: "decide-offers",
      type: "decide",
      component: "offers",
      label: "Next",
      config: {
        offers: ["Save a phrase for later"],
      },
    });
  } else {
    steps.push({
      id: "decide-debrief",
      type: "decide",
      component: "debrief-prompt",
      label: "Debrief",
      config: {},
    });
  }

  return {
    methodId: entry.id,
    steps,
  };
}

export function resolveGuidedRecipe(ctx: SessionContext): ExerciseRecipe | null {
  if (!isGuidedMethodId(ctx.methodId)) return null;
  const entry = loadMethodEntry(ctx.methodId);
  if (!entry) return null;
  return buildGuidedRecipe(entry);
}
