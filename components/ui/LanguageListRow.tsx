"use client";

import type { ReactNode } from "react";

import { Chip } from "@/components/ui/Chip";
import { cardPressable, disabledState } from "@/components/ui/interaction-kernel";
import { TextLink } from "@/components/ui/TextLink";
import { languageLabel, type LanguageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * One language card — profile rows and the shell switcher popover share this.
 * Contract: docs/specs/component/language-list-row.md
 */

export const languageListRowSurfaceClass =
  "flex w-full items-start justify-between gap-4 rounded-card border border-line bg-surface p-4 text-left";

const interactiveSurfaceClass = cn(
  languageListRowSurfaceClass,
  cardPressable,
  "cursor-pointer",
  disabledState,
);

export type LanguageListRowStanding = {
  held: number;
  pool: number;
};

export type LanguageListRowProps = {
  code: string;
  /** Override labels when the code is not a learning language (e.g. spoken `en` / `de`). */
  names?: Pick<LanguageLabel, "endonym" | "english">;
  isActive: boolean;
  activeLabel: string;
  standing?: LanguageListRowStanding | null;
  standingLabel?: (held: number, pool: number) => string;
  viewProgressHref?: string;
  viewProgressLabel?: string;
  /**
   * Profile: form + SubmitButton. Prefer `children` for server actions — the
   * composition slot keeps actions on the server side of the boundary.
   */
  actionSlot?: ReactNode;
  /** Profile action area when `actionSlot` is not used. */
  children?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
};

export function LanguageListRow({
  code,
  names,
  isActive,
  activeLabel,
  standing,
  standingLabel,
  viewProgressHref,
  viewProgressLabel,
  actionSlot,
  children,
  onSelect,
  disabled = false,
  className,
}: LanguageListRowProps) {
  const labels = names ?? languageLabel(code);

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">{labels.endonym}</p>
        <p className="text-sm text-muted">{labels.english}</p>

        {standing && standingLabel ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm leading-relaxed text-muted">
              {standingLabel(standing.held, standing.pool)}
            </p>
            {viewProgressHref && viewProgressLabel ? (
              <TextLink href={viewProgressHref} size="sm" className="font-medium no-underline hover:underline">
                {viewProgressLabel}
              </TextLink>
            ) : null}
          </div>
        ) : null}
      </div>

      {isActive ? (
        <Chip tone="selected" className="shrink-0" aria-current="true">
          {activeLabel}
        </Chip>
      ) : (
        actionSlot ?? children ?? null
      )}
    </>
  );

  if (!isActive && onSelect) {
    return (
      <button
        type="button"
        className={cn(interactiveSurfaceClass, className)}
        disabled={disabled}
        onClick={onSelect}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={cn(languageListRowSurfaceClass, className)} aria-current={isActive ? "true" : undefined}>
      {body}
    </div>
  );
}
