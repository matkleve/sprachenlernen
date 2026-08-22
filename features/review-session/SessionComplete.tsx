"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { ActionLink } from "@/components/ui/ActionLink";
import { sessionLoopPayoffAction } from "@/features/review-session/actions";
import { routes } from "@/lib/routes";
import type { SessionGrade, SessionLoopPayoff } from "@/lib/session-loop-payoff";
import { TextLink } from "@/components/ui/TextLink";

type SessionCompleteProps = {
  gradedCount: number;
  pendingCount: number;
  compact?: boolean;
  sessionGrades: readonly SessionGrade[];
  heldLemmasAtStart: readonly string[];
};

export function SessionComplete({
  gradedCount,
  pendingCount,
  compact = false,
  sessionGrades,
  heldLemmasAtStart,
}: SessionCompleteProps) {
  const t = useTranslations("reviewSession");
  const tLoop = useTranslations("contentTrace");
  const [payoff, setPayoff] = useState<SessionLoopPayoff | null>(null);

  useEffect(() => {
    if (sessionGrades.length === 0) return;

    let cancelled = false;
    void sessionLoopPayoffAction({ heldLemmasAtStart, sessionGrades }).then((outcome) => {
      if (cancelled || outcome.status !== "ok") return;
      setPayoff(outcome.payoff);
    });

    return () => {
      cancelled = true;
    };
  }, [heldLemmasAtStart, sessionGrades]);

  return (
    <div className={compact ? "mt-4 min-h-0 flex-1 overflow-y-auto md:mt-page-content" : "mt-page-content"}>
      <h2 className="text-xl font-semibold text-ink">{t("completeTitle")}</h2>
      <p className="mt-4 text-base text-muted">
        {gradedCount > 0 ? t("completeBody", { count: gradedCount }) : t("emptySession")}
      </p>
      {pendingCount > 0 ? (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {pendingCount === 1 ? t("syncPendingOne") : t("syncPending", { count: pendingCount })}
        </p>
      ) : null}

      {payoff?.kind === "payoff" ? (
        <section className="mt-6 rounded-card border border-line bg-surface-raised p-5 shadow-soft">
          <p className="text-base text-ink">
            {tLoop("session.next", { heldCount: payoff.newlyHeldCount })}
          </p>
          {payoff.sourceDeltas.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {payoff.sourceDeltas.map((delta) => (
                <li key={delta.id}>
                  <TextLink href={routes.contentDetail(delta.id)} tone="ink" size="sm">
                    {tLoop("session.sourceDelta", {
                      title: delta.title,
                      before: delta.beforePercent,
                      after: delta.afterPercent,
                    })}
                  </TextLink>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4">
            <ActionLink
              href={payoff.linkTarget === "content" ? routes.content : routes.words}
              variant="secondary"
              size="sm"
            >
              {payoff.linkTarget === "content"
                ? tLoop("session.linkContent")
                : tLoop("session.linkWords")}
            </ActionLink>
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink href={routes.words} variant="primary">
          {t("backToWords")}
        </ActionLink>
        <ActionLink href={routes.methods} variant="secondary">
          {t("backToMethods")}
        </ActionLink>
      </div>
    </div>
  );
}
