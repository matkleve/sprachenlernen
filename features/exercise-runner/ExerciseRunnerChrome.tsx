"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";
import { progressLabel } from "@/lib/exercise-runner";
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

function segmentBarClass(status: ExerciseRunnerState["stepStatuses"][number]): string {
  switch (status) {
    case "done":
      return "bg-accent-soft dark:bg-accent/35";
    case "seen":
      return "bg-line-strong/45";
    default:
      return "bg-line";
  }
}

export function ExerciseRunnerProgress({
  state,
  onTogglePause,
}: Pick<ExerciseRunnerChromeProps, "state" | "onTogglePause">) {
  const t = useTranslations("exerciseRunner");

  return (
    <div className="w-full shrink-0 space-y-2">
      <div
        className="flex gap-1.5"
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
              "h-2 min-w-0 flex-1 rounded-full transition-colors",
              segmentBarClass(state.stepStatuses[index] ?? "unseen"),
            )}
            aria-hidden
          />
        ))}
      </div>
      <p className="text-xs font-medium text-muted">
        {t("progress", {
          current: state.activeStepIndex + 1,
          total: state.recipe.steps.length,
        })}
        <span className="text-muted/80"> · {progressLabel(state)}</span>
      </p>
      {state.timer ? (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
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
      <footer className="relative mt-auto shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {bodyScrolls ? (
          <div
            className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-canvas to-transparent"
            aria-hidden
          />
        ) : null}
        <div className="relative border-t border-line bg-canvas/95 px-1 pt-3 backdrop-blur-sm">
          <ExerciseRunnerProgress state={state} onTogglePause={onTogglePause} />
          <div className="mt-3 flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!canGoBack}
              onClick={onBack}
              aria-label={t("prevStep")}
              className="min-w-11 px-3"
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
              className="min-w-11 px-3"
            >
              ▶
            </Button>
          </div>
          {showPrimary ? (
            <Button
              type="button"
              size="lg"
              className="w-auto max-w-full min-w-[11rem]"
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

/** @deprecated Use ExerciseRunnerHero + ExerciseRunnerProgress + ExerciseRunnerFooter */
export function ExerciseRunnerChrome(props: ExerciseRunnerChromeProps) {
  return (
    <>
      <ExerciseRunnerProgress state={props.state} onTogglePause={props.onTogglePause} />
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
