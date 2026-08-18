"use client";

import { AudioPlayStep } from "@/features/exercise-runner/steps/AudioPlayStep";
import { ConfirmDoneStep } from "@/features/exercise-runner/steps/ConfirmDoneStep";
import { ClozeTypeStep } from "@/features/exercise-runner/steps/ClozeTypeStep";
import { ComprehensionQuestionsStep } from "@/features/exercise-runner/steps/ComprehensionQuestionsStep";
import { CaptureStep } from "@/features/exercise-runner/steps/CaptureStep";
import { ChecklistStep } from "@/features/exercise-runner/steps/ChecklistStep";
import { DiffHighlightStep } from "@/features/exercise-runner/steps/DiffHighlightStep";
import { DebriefPromptStep } from "@/features/exercise-runner/steps/DebriefPromptStep";
import { FullDictationStep } from "@/features/exercise-runner/steps/FullDictationStep";
import { GapFillStep } from "@/features/exercise-runner/steps/GapFillStep";
import { MaterialPreviewStep } from "@/features/exercise-runner/steps/MaterialPreviewStep";
import { MinimalPairStep } from "@/features/exercise-runner/steps/MinimalPairStep";
import { NotBuiltStep } from "@/features/exercise-runner/steps/NotBuiltStep";
import { OffersStep } from "@/features/exercise-runner/steps/OffersStep";
import { PromptStep } from "@/features/exercise-runner/steps/PromptStep";
import { RubricStep } from "@/features/exercise-runner/steps/RubricStep";
import { RoundMarkerStep } from "@/features/exercise-runner/steps/RoundMarkerStep";
import { RevealAnswerStep } from "@/features/exercise-runner/steps/RevealAnswerStep";
import { SelfMarkStep } from "@/features/exercise-runner/steps/SelfMarkStep";
import { TypeFreelyStep } from "@/features/exercise-runner/steps/TypeFreelyStep";
import { VoiceSubmitStep } from "@/features/exercise-runner/steps/VoiceSubmitStep";
import { SheetDownloadStep } from "@/features/exercise-runner/steps/SheetDownloadStep";
import { SpeakPromptStep } from "@/features/exercise-runner/steps/SpeakPromptStep";
import { SummaryStep } from "@/features/exercise-runner/steps/SummaryStep";
import { TextDisplayStep } from "@/features/exercise-runner/steps/TextDisplayStep";
import { TimedWriteStep } from "@/features/exercise-runner/steps/TimedWriteStep";
import { TypeWithWordStep } from "@/features/exercise-runner/steps/TypeWithWordStep";
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
    case "audio-play":
      return (
        <AudioPlayStep config={step.config} listeningDeferred={props.listeningDeferred} />
      );
    case "type-with-word":
      return <TypeWithWordStep config={step.config} />;
    case "cloze-type":
      return <ClozeTypeStep config={step.config} />;
    case "minimal-pair":
      return (
        <MinimalPairStep config={step.config} listeningDeferred={props.listeningDeferred} />
      );
    case "timed-write":
      return <TimedWriteStep config={step.config} />;
    case "round-marker":
      return <RoundMarkerStep config={step.config} />;
    case "type-freely":
      return (
        <TypeFreelyStep
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
    case "voice-submit":
      return (
        <VoiceSubmitStep
          config={step.config}
          submitDraft={props.submitDraft}
          onAudioChange={props.onAudioChange ?? (() => undefined)}
        />
      );
    case "confirm-done":
      return <ConfirmDoneStep step={step} />;
    case "self-mark":
    case "feedback":
      return (
        <SelfMarkStep
          step={step}
          markedErrorTokens={props.markedErrorTokens}
          onToggleError={props.onToggleError}
        />
      );
    case "reveal-answer":
      return <RevealAnswerStep config={step.config} />;
    case "diff-highlight":
      return <DiffHighlightStep config={step.config} submitDraft={props.submitDraft} />;
    case "rubric":
      return <RubricStep config={step.config} />;
    case "comprehension-questions":
      return <ComprehensionQuestionsStep config={step.config} />;
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
    case "debrief-prompt":
      return (
        <DebriefPromptStep
          step={step}
          submitDraft={props.submitDraft}
          onTextChange={props.onTextChange}
          onDecline={props.onDecline}
          onSelectOffer={props.onSelectOffer}
        />
      );
    default:
      return <NotBuiltStep step={step} />;
  }
}
