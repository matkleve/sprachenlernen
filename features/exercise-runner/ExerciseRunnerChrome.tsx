"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";
import { progressLabel, segmentBarClass } from "@/lib/exercise-runner";
import { cn } from "@/lib/utils";

type ExerciseRunnerChromeProps = {
  sectionLabel: string;
  methodName: string;
  state: ExerciseRunnerState;
  activeLabel?: string;
  bodyScrolls?: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  canComplete: boolean;
  showStopConfirm: boolean;
  primaryLabel: string;
  onBack: () => void;
  onForward: () => void;
  onComplete: () => void;
  onStop: () => void;
  onCancelStop: () => void;
  onConfirmStop: () => void;
  onTogglePause: () => void;
};

function timerSeconds(state: ExerciseRunnerState): number {
  if (!state.timer) return 0;
  return Math.floor(state.timer.elapsedMs / 1000);
}

function primaryLabelKey(stepType: ExerciseRunnerState["recipe"]["steps"][number]["type"]): string {
  switch (stepType) {
    case "prepare":
      return "primaryPrepare";
    case "do":
      return "primaryDo";
    case "wait":
      return "primaryWait";
    case "submit":
      return "primarySubmit";
    case "review":
      return "primaryReview";
    default:
      return "primaryDecide";
  }
}

export function ExerciseRunnerProgressBar({
  state,
  showStepLabel = true,
  compact = false,
}: {
  state: ExerciseRunnerState;
  showStepLabel?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("exerciseRunner");

  return (
    <div className={cn("w-full space-y-1", compact ? "space-y-0.5" : "space-y-2")}>
      <div
        className="flex gap-1 max-md:gap-0.5 md:gap-1.5"
        role="progressbar"
        aria-valuenow={state.activeStepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={state.recipe.steps.length}
        aria-label={t("progress", {
          current: state.activeStepIndex + 1,
          total: state.recipe.steps.length,
        })}
      >
        {state.recipe.steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "min-w-0 flex-1 rounded-full transition-colors max-md:h-1 md:h-2",
              segmentBarClass(
                index,
                state.activeStepIndex,
                state.stepStatuses[index] ?? "unseen",
              ),
            )}
            aria-hidden
          />
        ))}
      </div>
      {showStepLabel ? (
        <p className="text-xs font-medium text-muted max-md:text-[0.65rem]">
          {t("progress", {
            current: state.activeStepIndex + 1,
            total: state.recipe.steps.length,
          })}
          <span className="text-muted/80 max-md:hidden"> · {progressLabel(state)}</span>
        </p>
      ) : null}
    </div>
  );
}

function ExerciseRunnerTimer({
  state,
  onTogglePause,
}: Pick<ExerciseRunnerChromeProps, "state" | "onTogglePause">) {
  const t = useTranslations("exerciseRunner");
  if (!state.timer) return null;

  return (
    <div className="flex items-center gap-2 max-md:mt-1 max-md:gap-1.5">
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-medium max-md:px-2 max-md:py-0.5 max-md:text-[0.65rem]",
          state.timer.expired
            ? "bg-surface-raised text-ink ring-1 ring-line"
            : "bg-accent-soft text-ink",
        )}
      >
        {state.timer.expired
          ? t("timerExpired")
          : t("timerRunning", { seconds: timerSeconds(state) })}
      </span>
      <Button type="button" variant="secondary" size="sm" onClick={onTogglePause}>
        {state.timer.pausedAt !== null ? t("timerResume") : t("timerPause")}
      </Button>
    </div>
  );
}

/** @deprecated Titles live on ExerciseRunnerHero; progress lives in footer */
export function ExerciseRunnerProgress({
  state,
  onTogglePause,
}: Pick<ExerciseRunnerChromeProps, "state" | "onTogglePause">) {
  return (
    <div className="w-full shrink-0">
      <ExerciseRunnerProgressBar state={state} />
      <ExerciseRunnerTimer state={state} onTogglePause={onTogglePause} />
    </div>
  );
}

/** @deprecated Titles live on ExerciseRunnerHero; use ExerciseRunnerProgress */
export function ExerciseRunnerHeader({
  state,
  onTogglePause,
}: Pick<ExerciseRunnerChromeProps, "state" | "onTogglePause">) {
  return <ExerciseRunnerProgress state={state} onTogglePause={onTogglePause} />;
}

export function ExerciseRunnerFooter({
  state,
  bodyScrolls = false,
  canGoBack,
  canGoForward,
  canComplete,
  showStopConfirm,
  primaryLabel,
  onBack,
  onForward,
  onComplete,
  onCancelStop,
  onConfirmStop,
  onTogglePause,
}: Pick<
  ExerciseRunnerChromeProps,
  | "state"
  | "bodyScrolls"
  | "canGoBack"
  | "canGoForward"
  | "canComplete"
  | "showStopConfirm"
  | "primaryLabel"
  | "onBack"
  | "onForward"
  | "onComplete"
  | "onCancelStop"
  | "onConfirmStop"
  | "onTogglePause"
>) {
  const t = useTranslations("exerciseRunner");
  const step = state.recipe.steps[state.activeStepIndex];
  const showPrimary = step?.type !== "decide";

  return (
    <>
      <footer
        className={cn(
          "relative mt-auto shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          "max-md:min-h-[var(--height-practice-footer)]",
        )}
      >
        {bodyScrolls ? (
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-canvas to-transparent"
            aria-hidden
          />
        ) : null}
        <div className="relative border-t border-line bg-canvas/95 px-1 pt-2 backdrop-blur-sm md:pt-3">
          <div className="max-md:hidden">
            <ExerciseRunnerProgress state={state} onTogglePause={onTogglePause} />
          </div>
          <div className="mb-2 md:hidden">
            <ExerciseRunnerProgressBar state={state} showStepLabel={false} compact />
            <ExerciseRunnerTimer state={state} onTogglePause={onTogglePause} />
          </div>
          <div
            className={cn(
              "flex flex-col items-end gap-3 md:mt-3",
              "max-md:flex-row max-md:items-center max-md:justify-end max-md:gap-2 max-md:mb-0",
            )}
          >
            <div className="flex items-center gap-2 max-md:gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!canGoBack}
                onClick={onBack}
                aria-label={t("prevStep")}
                className="min-w-11 px-3 max-md:min-w-10 max-md:px-2.5"
              >
                ◀
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!canGoForward}
                onClick={onForward}
                aria-label={t("nextStep")}
                className="min-w-11 px-3 max-md:min-w-10 max-md:px-2.5"
              >
                ▶
              </Button>
            </div>
            {showPrimary ? (
              <Button
                type="button"
                size="lg"
                className={cn(
                  "w-auto max-w-full min-w-[11rem]",
                  "max-md:h-10 max-md:min-w-0 max-md:flex-1 max-md:max-w-[14rem] max-md:text-sm",
                )}
                disabled={!canComplete}
                onClick={onComplete}
              >
                {primaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </footer>

      <Dialog
        open={showStopConfirm}
        onClose={onCancelStop}
        title={t("stopConfirmTitle")}
        description={t("stopConfirmBody")}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancelStop}>
            {t("stopCancel")}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirmStop}>
            {t("stopConfirm")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/** @deprecated Use ExerciseRunnerHero + ExerciseRunnerFooter */
export function ExerciseRunnerChrome(props: ExerciseRunnerChromeProps) {
  return (
    <ExerciseRunnerFooter
      state={props.state}
      bodyScrolls={props.bodyScrolls}
      canGoBack={props.canGoBack}
      canGoForward={props.canGoForward}
      canComplete={props.canComplete}
      showStopConfirm={props.showStopConfirm}
      primaryLabel={props.primaryLabel}
      onBack={props.onBack}
      onForward={props.onForward}
      onComplete={props.onComplete}
      onCancelStop={props.onCancelStop}
      onConfirmStop={props.onConfirmStop}
      onTogglePause={props.onTogglePause}
    />
  );
}

export function primaryLabelForStep(
  step: ExerciseRunnerState["recipe"]["steps"][number] | null,
  t: ReturnType<typeof useTranslations<"exerciseRunner">>,
): string {
  if (!step) return "";
  return t(primaryLabelKey(step.type) as "primaryPrepare");
}
