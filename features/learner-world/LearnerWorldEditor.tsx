"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PressableCard } from "@/components/ui/PressableCard";
import { saveLearnerWorldFromProfileAction } from "@/features/learner-world/actions";
import { LEARNER_WORLD_IDS, type LearnerWorldId } from "@/lib/learner-world";
import { cn } from "@/lib/utils";

export type LearnerWorldEditorProps = {
  languageCode: string;
  currentWorldId: LearnerWorldId;
};

export function LearnerWorldEditor({ languageCode, currentWorldId }: LearnerWorldEditorProps) {
  const t = useTranslations("learnerWorld");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingWorld, setPendingWorld] = useState<LearnerWorldId | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const label = currentWorldId === "general" ? t("world.general") : t(`world.${currentWorldId}`);

  const requestSave = (worldId: LearnerWorldId) => {
    if (worldId === currentWorldId) {
      setOpen(false);
      return;
    }
    setPendingWorld(worldId);
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    if (!pendingWorld) return;
    setError(null);
    startTransition(async () => {
      const outcome = await saveLearnerWorldFromProfileAction(languageCode, pendingWorld);
      if (outcome.status === "error") {
        setError(outcome.error);
        return;
      }
      setConfirmOpen(false);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        className="mt-2 text-left text-sm text-muted underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => setOpen(true)}
      >
        {currentWorldId === "general" ? t("profileAddWorld") : t("profileWorld", { world: label })}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t("pickTitle")}>
        <ul className="grid gap-3">
          {LEARNER_WORLD_IDS.map((worldId) => (
            <li key={worldId}>
              <PressableCard
                type="button"
                aria-pressed={worldId === currentWorldId}
                onClick={() => requestSave(worldId)}
                className={cn(
                  "w-full text-left",
                  worldId === currentWorldId && "border-accent bg-accent-soft",
                )}
              >
                <span className="text-base font-medium text-ink">{t(`world.${worldId}`)}</span>
              </PressableCard>
            </li>
          ))}
        </ul>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("switchTitle")}>
        <p className="text-base leading-relaxed text-muted">
          {t("switchBody", { world: pendingWorld ? t(`world.${pendingWorld}`) : "" })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" pending={pending} onClick={confirmSave}>
            {t("switchConfirm")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t("switchCancel")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
