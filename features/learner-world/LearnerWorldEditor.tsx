"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { OptionButton } from "@/components/ui/OptionButton";
import { saveLearnerWorldFromProfileAction } from "@/features/learner-world/actions";
import { LEARNER_WORLD_IDS, type LearnerWorldId } from "@/lib/learner-world";

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-auto justify-start px-0 text-sm font-normal text-muted underline-offset-2 hover:underline"
        onClick={() => setOpen(true)}
      >
        {currentWorldId === "general" ? t("profileAddWorld") : t("profileWorld", { world: label })}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t("pickTitle")}>
        <ul className="grid gap-3">
          {LEARNER_WORLD_IDS.map((worldId) => (
            <li key={worldId}>
              <OptionButton
                layout="row"
                selected={worldId === currentWorldId}
                onClick={() => requestSave(worldId)}
              >
                {t(`world.${worldId}`)}
              </OptionButton>
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
