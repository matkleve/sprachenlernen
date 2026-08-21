/**
 * Every shipped step component, declared once. Contract:
 * docs/specs/service/exercise-step-components.md
 *
 * The id used to live in four hand-kept places — a shipped-ids array, a
 * step-type map, the render switch, and the spec table — with nothing checking
 * they agreed. A component missing from the switch fell through to *not built
 * yet* copy in front of the learner while every test stayed green. Everything
 * except the React element is derived from this file now; the renderer map in
 * `features/exercise-runner/step-registry.tsx` is keyed by these ids, so
 * forgetting one is a type error.
 */
import type { StepAnswer, StepType } from "@/lib/exercise-runner/types";

import { parseWith, passthrough, type ConfigParse } from "./config";

export type StepComponentSpec<TConfig> = {
  stepTypes: readonly StepType[];
  parseConfig: (raw: Record<string, unknown>) => ConfigParse<TConfig>;
  /** Gate on the primary button. Absent means "always completable". */
  canComplete?: (config: TConfig, answer: StepAnswer) => boolean;
  /** Overrides the step-type default label. Absent means "use the type's". */
  primaryLabelKey?: (config: TConfig, answer: StepAnswer) => string | undefined;
};

/** The spec with its config type erased, so descriptors can share one map. */
export type StepComponentDescriptor = {
  stepTypes: readonly StepType[];
  parseConfig: (raw: Record<string, unknown>) => ConfigParse<unknown>;
  canComplete: (raw: Record<string, unknown>, answer: StepAnswer) => boolean;
  primaryLabelKey: (raw: Record<string, unknown>, answer: StepAnswer) => string | undefined;
};

function define<TConfig>(spec: StepComponentSpec<TConfig>): StepComponentDescriptor {
  return {
    stepTypes: spec.stepTypes,
    parseConfig: spec.parseConfig,
    canComplete: (raw, answer) => {
      if (!spec.canComplete) return true;
      const parsed = spec.parseConfig(raw);
      // A misconfigured step shows an honest error and must not also trap the
      // learner behind a gate it cannot evaluate.
      return parsed.ok ? spec.canComplete(parsed.config, answer) : true;
    },
    primaryLabelKey: (raw, answer) => {
      if (!spec.primaryLabelKey) return undefined;
      const parsed = spec.parseConfig(raw);
      return parsed.ok ? spec.primaryLabelKey(parsed.config, answer) : undefined;
    },
  };
}

export type CaptureConfig = { accept: string[]; required: boolean };
export type SentenceCheckConfig = {
  word: string;
  lemma: string;
  gloss: string;
  itemIndex?: number;
  itemCount?: number;
};

export const STEP_COMPONENT_DESCRIPTORS = {
  checklist: define({ stepTypes: ["prepare"], parseConfig: passthrough }),
  "material-preview": define({ stepTypes: ["prepare"], parseConfig: passthrough }),
  "sheet-download": define({ stepTypes: ["prepare"], parseConfig: passthrough }),
  prompt: define({ stepTypes: ["do"], parseConfig: passthrough }),
  "text-display": define({ stepTypes: ["do"], parseConfig: passthrough }),
  "speak-prompt": define({ stepTypes: ["do"], parseConfig: passthrough }),
  "timed-write": define({ stepTypes: ["do"], parseConfig: passthrough }),
  "gap-fill": define({ stepTypes: ["do"], parseConfig: passthrough }),
  "full-dictation": define({ stepTypes: ["do"], parseConfig: passthrough }),

  "sentence-check": define<SentenceCheckConfig>({
    stepTypes: ["do"],
    parseConfig: (raw) =>
      parseWith(raw, (read) => ({
        word: read.required("word"),
        lemma: read.required("lemma"),
        gloss: read.string("gloss"),
        itemIndex: read.number("itemIndex"),
        itemCount: read.number("itemCount"),
      })),
    /**
     * The one gate in the catalogue. Writing and then pressing **Prüfen** is
     * the method — skipping the check would leave the learner exactly where the
     * old two-screen version left them. Once any check has returned, the step
     * always completes: a checker that is wrong must never trap anyone, so the
     * label softens to "trotzdem weiter" rather than the button going dead.
     */
    canComplete: (_config, answer) => answer.check.phase === "checked",
    primaryLabelKey: (_config, answer) =>
      answer.check.phase === "checked" &&
      answer.check.result.status === "checked" &&
      answer.check.result.findings.length > 0
        ? "primaryContinueAnyway"
        : undefined,
  }),

  capture: define<CaptureConfig>({
    stepTypes: ["submit"],
    parseConfig: (raw) =>
      parseWith(raw, (read) => ({
        accept: read.strings("accept"),
        required: read.boolean("required", true) ?? true,
      })),
    canComplete: (config, answer) => {
      if (!config.required) return true;
      const wantsPhoto = config.accept.includes("photo");
      const wantsText = config.accept.includes("text");
      const hasPhoto = Boolean(answer.photoDataUrl);
      const hasText = answer.text.trim().length > 0;

      if (wantsPhoto && wantsText) return hasPhoto || hasText;
      if (wantsPhoto) return hasPhoto;
      if (wantsText) return hasText;
      return true;
    },
  }),

  "self-mark": define({ stepTypes: ["review"], parseConfig: passthrough }),
  feedback: define({ stepTypes: ["review"], parseConfig: passthrough }),
  "comprehension-questions": define({ stepTypes: ["review"], parseConfig: passthrough }),
  "reveal-answer": define({ stepTypes: ["review"], parseConfig: passthrough }),
  offers: define({ stepTypes: ["decide"], parseConfig: passthrough }),
  summary: define({ stepTypes: ["decide"], parseConfig: passthrough }),
} as const satisfies Record<string, StepComponentDescriptor>;

export type ShippedStepComponentId = keyof typeof STEP_COMPONENT_DESCRIPTORS;
