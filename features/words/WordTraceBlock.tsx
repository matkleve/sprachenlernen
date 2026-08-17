"use client";

import { useTranslations } from "next-intl";

import { TextLink } from "@/components/ui/TextLink";
import type { WordTraceView } from "@/lib/content-traceability";
import { routes } from "@/lib/routes";

export function WordTraceBlock({ trace }: { trace: WordTraceView }) {
  const t = useTranslations("contentTrace");

  if (trace.kind === "empty") {
    return (
      <section
        className="mt-5 border-t border-line pt-5"
        aria-label={t("word.emptyHeading")}
      >
        <p className="text-sm leading-relaxed text-muted">{t("word.empty")}</p>
        <TextLink href={routes.content} tone="accent" size="sm" className="mt-3 inline-flex">
          {t("word.emptyLink")}
        </TextLink>
      </section>
    );
  }

  return (
    <section className="mt-5 border-t border-line pt-5" aria-label={t("word.sectionLabel")}>
      <p className="text-sm leading-relaxed text-muted">
        {t("word.summary", { count: trace.appearanceCount })}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink">{t("word.next", { count: trace.appearanceCount })}</p>
      <ul className="mt-3 list-none space-y-2">
        {trace.topSources.map((source) => (
          <li key={source.id}>
            <TextLink href={routes.contentDetail(source.id)} tone="ink" size="sm">
              {source.title}
            </TextLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
