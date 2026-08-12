"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Chip } from "@/components/ui/Chip";
import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * One language card — profile rows and the shell switcher popover share this.
 * Contract: docs/specs/component/language-list-row.md
 */

export const languageListRowSurfaceClass =
  "flex w-full items-start justify-between gap-4 rounded-card border border-line bg-surface p-4 text-left";

const interactiveSurfaceClass = cn(
  languageListRowSurfaceClass,
  "cursor-pointer transition-[background-color,border-color] duration-150 ease-out-soft",
  "hover:border-line-strong hover:bg-accent-soft",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
);

export type LanguageListRowStanding = {
  held: number;
  pool: number;
};

export type LanguageListRowProps = {
  code: string;
  isActive: boolean;
  activeLabel: string;
  standing?: LanguageListRowStanding | null;
  standingLabel?: (held: number, pool: number) => string;
  viewProgressHref?: string;
  viewProgressLabel?: string;
  /** Profile: form + SubmitButton. Switcher: omit and use `onSelect`. */
  actionSlot?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
};

export function LanguageListRow({
  code,
  isActive,
  activeLabel,
  standing,
  standingLabel,
  viewProgressHref,
  viewProgressLabel,
  actionSlot,
  onSelect,
  disabled = false,
  className,
}: LanguageListRowProps) {
  const names = languageLabel(code);

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">{names.endonym}</p>
        <p className="text-sm text-muted">{names.english}</p>

        {standing && standingLabel ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm leading-relaxed text-muted">
              {standingLabel(standing.held, standing.pool)}
            </p>
            {viewProgressHref && viewProgressLabel ? (
              <Link
                href={viewProgressHref}
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                {viewProgressLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {isActive ? (
        <Chip tone="accent" className="shrink-0 border border-accent" aria-current="true">
          {activeLabel}
        </Chip>
      ) : (
        actionSlot ?? null
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
