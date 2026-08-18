"use client";

import { CaptureStep } from "@/features/exercise-runner/steps/CaptureStep";
import { ChecklistStep } from "@/features/exercise-runner/steps/ChecklistStep";
import { GapFillStep } from "@/features/exercise-runner/steps/GapFillStep";
import { NotBuiltStep } from "@/features/exercise-runner/steps/NotBuiltStep";
import { OffersStep } from "@/features/exercise-runner/steps/OffersStep";
import { PromptStep } from "@/features/exercise-runner/steps/PromptStep";
import { SelfMarkStep } from "@/features/exercise-runner/steps/SelfMarkStep";
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
    case "gap-fill":
      return <GapFillStep config={step.config} listeningDeferred={props.listeningDeferred} />;
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
          markedErrorTokens={props.markedErrorTokens}
          onToggleError={props.onToggleError}
        />
      );
    case "offers":
      return (
        <OffersStep
          step={step}
          onDecline={props.onDecline}
          onSelectOffer={props.onSelectOffer}
        />
      );
    default:
      return <NotBuiltStep step={step} />;
  }
}
