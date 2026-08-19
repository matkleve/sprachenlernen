"use client";

import { useTranslations } from "next-intl";

import {
  ExerciseRunnerFooter,
  primaryLabelForStep,
} from "@/features/exercise-runner/ExerciseRunnerChrome";
import {
  ExerciseRunnerHero,
  ExerciseRunnerMobileStrip,
} from "@/features/exercise-runner/ExerciseRunnerHero";
import { ExerciseStepBody } from "@/features/exercise-runner/ExerciseStepBody";
import { resolveExerciseStepLabel } from "@/features/exercise-runner/step-label";
import { useExerciseRunner } from "@/features/exercise-runner/useExerciseRunner";
import { useListeningDefer } from "@/features/method-menu/useListeningDefer";
import type { ExerciseRecipe } from "@/lib/exercise-runner";
import {
  bodyZoneScrolls,
  exerciseStepContentProfile,
} from "@/lib/exercise-runner/content-profile";
import type { Section } from "@/lib/method-catalogue";
import { cn } from "@/lib/utils";

type ExerciseRunnerProps = {
  sectionLabel: string;
  methodName: string;
  section: Section;
  recipe: ExerciseRecipe;
};

export function ExerciseRunner({
  sectionLabel,
  methodName,
  section,
  recipe,
}: ExerciseRunnerProps) {
  const t = useTranslations("exerciseRunner");
  const { deferred: listeningDeferred } = useListeningDefer();
  const runner = useExerciseRunner({ recipe, methodName });
  const { state, activeStep } = runner;

  const rootClass = cn(
    "practice-fit-frame flex min-h-0 flex-1 flex-col gap-1.5 max-md:gap-1 md:gap-4",
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

  const stepLabel = resolveExerciseStepLabel(activeStep, (key) => t(key as "stepLabelPrepare"));
  const contentProfile = exerciseStepContentProfile(activeStep);
  const bodyScrolls = bodyZoneScrolls(contentProfile);

  return (
    <div className={rootClass}>
      <ExerciseRunnerMobileStrip
        stepLabel={stepLabel}
        stopLabel={t("stop")}
        onStop={runner.requestStop}
      />

      <div className="hidden shrink-0 space-y-4 md:block">
        <ExerciseRunnerHero
          section={section}
          sectionLabel={sectionLabel}
          methodName={methodName}
          stepLabel={stepLabel}
          stopLabel={t("stop")}
          onStop={runner.requestStop}
        />
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col p-1",
          bodyScrolls ? "overflow-y-auto" : "overflow-hidden",
        )}
      >
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
          bodyScrolls={bodyScrolls}
        />
      </div>

      <ExerciseRunnerFooter
        state={state}
        bodyScrolls={bodyScrolls}
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
        onTogglePause={runner.togglePause}
      />
    </div>
  );
}
