"use client";

import { useTranslations } from "next-intl";

import {
  ExerciseRunnerFooter,
  ExerciseRunnerHeader,
  primaryLabelForStep,
} from "@/features/exercise-runner/ExerciseRunnerChrome";
import { ExerciseStepBody } from "@/features/exercise-runner/ExerciseStepBody";
import { useExerciseRunner } from "@/features/exercise-runner/useExerciseRunner";
import { MethodCardHeader } from "@/features/method-menu/MethodCardHeader";
import { useListeningDefer } from "@/features/method-menu/useListeningDefer";
import type { ExerciseRecipe } from "@/lib/exercise-runner";
import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

type ExerciseRunnerProps = {
  sectionLabel: string;
  methodName: string;
  section: Section;
  recipe: ExerciseRecipe;
  /** Mobile one-screen layout — no page scroll on `< md`. */
  compact?: boolean;
};

export function ExerciseRunner({
  sectionLabel,
  methodName,
  section,
  recipe,
  compact = false,
}: ExerciseRunnerProps) {
  const t = useTranslations("exerciseRunner");
  const { deferred: listeningDeferred } = useListeningDefer();
  const runner = useExerciseRunner({ recipe, methodName });
  const { state, activeStep } = runner;

  const rootClass = cn(
    compact ? "flex min-h-0 flex-1 flex-col md:mt-page-content" : "mt-page-content",
  );

  if (state.phase === "abandoned") {
    return (
      <div className={rootClass}>
        <h2 className="text-xl font-semibold text-ink">{t("abandonedTitle")}</h2>
        <p className="mt-2 text-base text-muted">{t("abandonedBody")}</p>
      </div>
    );
  }

  if (state.phase === "complete") {
    return (
      <div className={rootClass}>
        <h2 className="text-xl font-semibold text-ink">{t("completeTitle")}</h2>
        <p className="mt-2 text-base text-muted">{t("completeBody")}</p>
      </div>
    );
  }

  if (!activeStep) {
    return null;
  }

  return (
    <div className={cn(rootClass, "flex min-h-0 flex-col gap-4")}>
      <MethodCardHeader section={section} size="card" className="h-28 rounded-card" />

      <ExerciseRunnerHeader
        sectionLabel={sectionLabel}
        methodName={methodName}
        state={state}
        activeLabel={activeStep.label}
        onStop={runner.requestStop}
        onTogglePause={runner.togglePause}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ExerciseStepBody
          step={activeStep}
          submitDraft={state.submitDraft}
          markedErrorTokens={state.markedErrorTokens}
          listeningDeferred={listeningDeferred}
          onTextChange={runner.setText}
          onPhotoChange={runner.setPhoto}
          onToggleError={runner.toggleError}
          onDecline={runner.decline}
          onSelectOffer={runner.completeCurrentStep}
        />
      </div>

      <ExerciseRunnerFooter
        state={state}
        canGoBack={runner.canGoBack}
        canGoForward={runner.canGoForward}
        canComplete={runner.canComplete}
        showStopConfirm={runner.showStopConfirm}
        primaryLabel={primaryLabelForStep(activeStep, t)}
        onBack={runner.goBack}
        onForward={runner.goForward}
        onComplete={runner.completeCurrentStep}
        onCancelStop={runner.cancelStop}
        onConfirmStop={runner.confirmStop}
      />
    </div>
  );
}
