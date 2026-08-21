"use client";

import type { ReactNode } from "react";

import { ComprehensionQuestionsStep } from "@/features/exercise-runner/steps/ComprehensionQuestionsStep";
import { CaptureStep } from "@/features/exercise-runner/steps/CaptureStep";
import { ChecklistStep } from "@/features/exercise-runner/steps/ChecklistStep";
import { FullDictationStep } from "@/features/exercise-runner/steps/FullDictationStep";
import { GapFillStep } from "@/features/exercise-runner/steps/GapFillStep";
import { MaterialPreviewStep } from "@/features/exercise-runner/steps/MaterialPreviewStep";
import { MisconfiguredStep } from "@/features/exercise-runner/steps/MisconfiguredStep";
import { NotBuiltStep } from "@/features/exercise-runner/steps/NotBuiltStep";
import { OffersStep } from "@/features/exercise-runner/steps/OffersStep";
import { SentenceCheckStep } from "@/features/exercise-runner/steps/SentenceCheckStep";
import { TimedWriteStep } from "@/features/exercise-runner/steps/TimedWriteStep";
import { PromptStep } from "@/features/exercise-runner/steps/PromptStep";
import { RevealAnswerStep } from "@/features/exercise-runner/steps/RevealAnswerStep";
import { SelfMarkStep } from "@/features/exercise-runner/steps/SelfMarkStep";
import { SheetDownloadStep } from "@/features/exercise-runner/steps/SheetDownloadStep";
import { SpeakPromptStep } from "@/features/exercise-runner/steps/SpeakPromptStep";
import { SummaryStep } from "@/features/exercise-runner/steps/SummaryStep";
import { TextDisplayStep } from "@/features/exercise-runner/steps/TextDisplayStep";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";
import { WaitStep } from "@/features/exercise-runner/steps/WaitStep";
import {
  isShippedStepComponent,
  isStepComponentRenderable,
  parseStepConfig,
  resolveStepComponentId,
  type SentenceCheckConfig,
  type ShippedStepComponentId,
} from "@/lib/exercise-step-components";

/**
 * One renderer per shipped component id. Typed as a total record on purpose:
 * adding a descriptor without a renderer is a compile error, where the old
 * `switch` fell through to *not built yet* copy in front of the learner with
 * every test still green.
 */
const RENDERERS: Record<
  ShippedStepComponentId,
  (props: StepRenderProps, config: unknown) => ReactNode
> = {
  checklist: ({ step }) => <ChecklistStep step={step} />,
  "material-preview": ({ step }) => <MaterialPreviewStep config={step.config} />,
  "sheet-download": ({ step }) => <SheetDownloadStep config={step.config} />,
  "gap-fill": ({ step, listeningDeferred }) => (
    <GapFillStep config={step.config} listeningDeferred={listeningDeferred} />
  ),
  "full-dictation": ({ step, listeningDeferred }) => (
    <FullDictationStep config={step.config} listeningDeferred={listeningDeferred} />
  ),
  "text-display": ({ step }) => <TextDisplayStep config={step.config} />,
  "speak-prompt": ({ step }) => <SpeakPromptStep config={step.config} />,
  "sentence-check": (props, config) => (
    <SentenceCheckStep
      config={config as SentenceCheckConfig}
      answer={props.answer}
      onTextChange={props.onTextChange}
      onCheckChange={props.onCheckChange}
    />
  ),
  "timed-write": ({ step, answer, onTextChange }) => (
    <TimedWriteStep config={step.config} answer={answer} onTextChange={onTextChange} />
  ),
  prompt: ({ step, listeningDeferred }) => (
    <PromptStep step={step} listeningDeferred={listeningDeferred} />
  ),
  capture: ({ answer, onTextChange, onPhotoChange }) => (
    <CaptureStep answer={answer} onTextChange={onTextChange} onPhotoChange={onPhotoChange} />
  ),
  "self-mark": ({ step, answer, onToggleError }) => (
    <SelfMarkStep step={step} answer={answer} onToggleError={onToggleError} />
  ),
  feedback: ({ step, answer, onToggleError }) => (
    <SelfMarkStep step={step} answer={answer} onToggleError={onToggleError} />
  ),
  "comprehension-questions": ({ step }) => (
    <ComprehensionQuestionsStep config={step.config} />
  ),
  "reveal-answer": ({ step, answer }) => (
    <RevealAnswerStep config={step.config} userSentence={answer.text} />
  ),
  offers: ({ step, onDecline, onSelectOffer }) => (
    <OffersStep step={step} onDecline={onDecline} onSelectOffer={onSelectOffer} />
  ),
  summary: ({ step, onDecline, onSelectOffer }) => (
    <SummaryStep step={step} onDecline={onDecline} onSelectOffer={onSelectOffer} />
  ),
};

export function renderExerciseStep(props: StepRenderProps) {
  const { step } = props;

  if (step.type === "wait") {
    return <WaitStep step={step} />;
  }

  if (!isStepComponentRenderable(step)) {
    return <NotBuiltStep step={step} />;
  }

  const componentId = resolveStepComponentId(step);
  if (!isShippedStepComponent(componentId)) {
    return <NotBuiltStep step={step} />;
  }

  // A recipe that omitted a key the component needs says so out loud. Rendering
  // an empty widget instead is the silent failure Constitution §4 forbids — and
  // is exactly how a renamed composer key used to go unnoticed.
  const parsed = parseStepConfig(step);
  if (!parsed.ok) {
    return <MisconfiguredStep componentId={componentId} missing={parsed.missing} />;
  }

  return RENDERERS[componentId](props, parsed.config);
}
