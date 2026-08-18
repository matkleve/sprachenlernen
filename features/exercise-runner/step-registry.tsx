"use client";

import { ComprehensionQuestionsStep } from "@/features/exercise-runner/steps/ComprehensionQuestionsStep";
import { CaptureStep } from "@/features/exercise-runner/steps/CaptureStep";
import { ChecklistStep } from "@/features/exercise-runner/steps/ChecklistStep";
import { FullDictationStep } from "@/features/exercise-runner/steps/FullDictationStep";
import { GapFillStep } from "@/features/exercise-runner/steps/GapFillStep";
import { MaterialPreviewStep } from "@/features/exercise-runner/steps/MaterialPreviewStep";
import { NotBuiltStep } from "@/features/exercise-runner/steps/NotBuiltStep";
import { OffersStep } from "@/features/exercise-runner/steps/OffersStep";
import { TimedWriteStep } from "@/features/exercise-runner/steps/TimedWriteStep";
import { TypeWithWordStep } from "@/features/exercise-runner/steps/TypeWithWordStep";
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
  resolveStepComponentId,
} from "@/lib/exercise-step-components";

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

  switch (componentId) {
    case "checklist":
      return <ChecklistStep step={step} />;
    case "material-preview":
      return <MaterialPreviewStep config={step.config} />;
    case "sheet-download":
      return <SheetDownloadStep config={step.config} />;
    case "gap-fill":
      return <GapFillStep config={step.config} listeningDeferred={props.listeningDeferred} />;
    case "full-dictation":
      return (
        <FullDictationStep config={step.config} listeningDeferred={props.listeningDeferred} />
      );
    case "text-display":
      return <TextDisplayStep config={step.config} />;
    case "speak-prompt":
      return <SpeakPromptStep config={step.config} />;
    case "type-with-word":
      return (
        <TypeWithWordStep
          config={step.config}
          value={props.submitDraft.text}
          onTextChange={props.onTextChange}
        />
      );
    case "timed-write":
      return (
        <TimedWriteStep
          config={step.config}
          submitDraft={props.submitDraft}
          onTextChange={props.onTextChange}
        />
      );
    case "prompt":
      return <PromptStep step={step} listeningDeferred={props.listeningDeferred} />;
    case "capture":
      return (
        <CaptureStep
          submitDraft={props.submitDraft}
          onTextChange={props.onTextChange}
          onPhotoChange={props.onPhotoChange}
        />
      );
    case "self-mark":
    case "feedback":
      return (
        <SelfMarkStep
          step={step}
          submitDraft={props.submitDraft}
          markedErrorTokens={props.markedErrorTokens}
          onToggleError={props.onToggleError}
        />
      );
    case "comprehension-questions":
      return <ComprehensionQuestionsStep config={step.config} />;
    case "reveal-answer":
      return <RevealAnswerStep config={step.config} userSentence={props.submitDraft.text} />;
    case "offers":
      return (
        <OffersStep
          step={step}
          onDecline={props.onDecline}
          onSelectOffer={props.onSelectOffer}
        />
      );
    case "summary":
      return (
        <SummaryStep
          step={step}
          onDecline={props.onDecline}
          onSelectOffer={props.onSelectOffer}
        />
      );
    default:
      return <NotBuiltStep step={step} />;
  }
}
