"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";
import { progressLabel } from "@/lib/exercise-runner";
import { cn } from "@/lib/utils";

type ExerciseRunnerChromeProps = {
  methodName: string;
  state: ExerciseRunnerState;
  activeLabel?: string;
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

export function ExerciseRunnerChrome({
  methodName,
  state,
  activeLabel,
  canGoBack,
  canGoForward,
  canComplete,
  showStopConfirm,
  primaryLabel,
  onBack,
  onForward,
  onComplete,
  onStop,
  onCancelStop,
  onConfirmStop,
  onTogglePause,
}: ExerciseRunnerChromeProps) {
  const t = useTranslations("exerciseRunner");
  const step = state.recipe.steps[state.activeStepIndex];
  const showPrimary = step?.type !== "decide";

  return (
    <>
      <header className="space-y-2 border-b border-line pb-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="truncate text-base font-semibold text-ink">{methodName}</h1>
          <Button type="button" variant="secondary" size="sm" onClick={onStop}>
            {t("stop")}
          </Button>
        </div>
        {activeLabel ? (
          <p className="truncate text-sm text-muted">{activeLabel}</p>
        ) : null}
        <div
          className="h-1.5 w-full rounded-full bg-line"
          role="progressbar"
          aria-valuenow={state.activeStepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={state.recipe.steps.length}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{
              width: `${((state.activeStepIndex + 1) / state.recipe.steps.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted">
          {t("progress", {
            current: state.activeStepIndex + 1,
            total: state.recipe.steps.length,
          })}{" "}
          ({progressLabel(state)})
        </p>
        {state.timer ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
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
        ) : null}
      </header>

      <div className="flex items-center justify-between gap-2 pt-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoBack}
          onClick={onBack}
          aria-label={t("prevStep")}
        >
          ◀
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canGoForward}
          onClick={onForward}
          aria-label={t("nextStep")}
        >
          ▶
        </Button>
      </div>

      {showPrimary ? (
        <div className="pt-4">
          <Button
            type="button"
            className="w-full"
            disabled={!canComplete}
            onClick={onComplete}
          >
            {primaryLabel}
          </Button>
        </div>
      ) : null}

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

export function primaryLabelForStep(
  step: ExerciseRunnerState["recipe"]["steps"][number] | null,
  t: ReturnType<typeof useTranslations<"exerciseRunner">>,
): string {
  if (!step) return "";
  return t(primaryLabelKey(step.type) as "primaryPrepare");
}
