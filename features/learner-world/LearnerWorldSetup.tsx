"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { PressableCard } from "@/components/ui/PressableCard";
import { saveLearnerWorldAction } from "@/features/learner-world/actions";
import { LEARNER_WORLD_IDS, type LearnerWorldId } from "@/lib/learner-world";
import { cn } from "@/lib/utils";

/**
 * Onboarding Lernwelt picker. Contract: docs/specs/feature/learner-world-setup.md
 */

export function LearnerWorldSetup() {
  const t = useTranslations("learnerWorld");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<LearnerWorldId>("general");
  const [pending, startTransition] = useTransition();

  const finish = (worldId: LearnerWorldId) => {
    startTransition(async () => {
      await saveLearnerWorldAction(worldId);
    });
  };

  if (step === 1) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-ink">{t("hookTitle")}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">{t("hookBody")}</p>
        <Button type="button" className="mt-8" onClick={() => setStep(2)}>
          {t("continue")}
        </Button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-ink">{t("pickTitle")}</h1>
        <ul className="mt-6 grid gap-3">
          {LEARNER_WORLD_IDS.map((worldId) => (
            <li key={worldId}>
              <PressableCard
                type="button"
                aria-pressed={selected === worldId}
                onClick={() => setSelected(worldId)}
                className={cn(
                  "w-full text-left",
                  selected === worldId && "border-accent bg-accent-soft",
                )}
              >
                <span className="text-base font-medium text-ink">{t(`world.${worldId}`)}</span>
              </PressableCard>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            pending={pending}
            onClick={() => (selected === "general" ? finish("general") : setStep(3))}
          >
            {selected === "general" ? t("startLearning") : t("continue")}
          </Button>
          <Button type="button" variant="secondary" pending={pending} onClick={() => finish("general")}>
            {t("skipGeneral")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-ink">{t("previewTitle")}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{t(`preview.${selected}`)}</p>
      <Button type="button" className="mt-8" pending={pending} onClick={() => finish(selected)}>
        {t("startLearning")}
      </Button>
    </div>
  );
}
