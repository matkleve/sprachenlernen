"use client";

import { useTranslations } from "next-intl";
import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import type { SessionLoopLineView } from "@/lib/session-loop-line";
import { routes } from "@/lib/routes";

type SessionCompleteProps = {
  gradedCount: number;
  pendingCount: number;
  loopLine?: SessionLoopLineView | null;
  compact?: boolean;
};

export function SessionComplete({
  gradedCount,
  pendingCount,
  loopLine = null,
  compact = false,
}: SessionCompleteProps) {
  const t = useTranslations("reviewSession");
  const tTrace = useTranslations("contentTrace");
  return (
    <div className={compact ? "mt-4 min-h-0 flex-1 overflow-y-auto md:mt-page-content" : "mt-page-content"}>
      <h2 className="text-xl font-semibold text-ink">{t('completeTitle')}</h2>
      <p className="mt-4 text-base text-muted">
        {gradedCount > 0 ? t('completeBody', { count: gradedCount }) : t('emptySession')}
      </p>
      {loopLine ? (
        <p className="mt-4 text-base text-ink" aria-live="polite">
          {tTrace("session.summary", { heldCount: loopLine.heldCount })}{" "}
          —{" "}
          <TextLink href={loopLine.href} tone="accent" size="sm">
            {tTrace("session.link")}
          </TextLink>
        </p>
      ) : null}
      {pendingCount > 0 ? (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {pendingCount === 1 ? t("syncPendingOne") : t("syncPending", { count: pendingCount })}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink href={routes.words} variant="primary">
          {t('backToWords')}
        </ActionLink>
        <ActionLink href={routes.methods} variant="secondary">
          {t('backToMethods')}
        </ActionLink>
      </div>
    </div>
  );
}
