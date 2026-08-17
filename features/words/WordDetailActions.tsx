"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { setWordLifecycleAction } from "@/features/words/actions";
import type { OrbitWordSegment } from "@/lib/vocabulary-orbit";

type WordDetailActionsProps = {
  segment: OrbitWordSegment;
};

export function WordDetailActions({ segment }: WordDetailActionsProps) {
  const t = useTranslations("words");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canSuspend = segment.reviewCount > 0 && segment.taskState !== "suspended";

  function run(action: "suspend" | "retire") {
    setError(null);
    startTransition(async () => {
      const result = await setWordLifecycleAction(segment.taskId, action);
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <div className="flex flex-wrap gap-3">
        {canSuspend ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => run("suspend")}
          >
            {t("wordDetailSuspend")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => run("retire")}
        >
          {t("wordDetailRetire")}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {canSuspend ? t("wordDetailActionFootnote") : t("wordDetailRetireHelpOnly")}
      </p>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
