import { Chip } from "@/components/ui/Chip";
import {
  disabledState,
  focusRing,
  interactionMotion,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * One language in the shell switcher menu. Contract:
 * docs/specs/component/language-switch-row.md
 */

const rowClass =
  "flex w-full items-start justify-between gap-3 rounded-card border border-line bg-surface p-3 text-left shadow-raised";

const interactiveRowClass = cn(
  rowClass,
  touchTarget,
  interactionMotion,
  "cursor-pointer hover:border-line-strong hover:bg-accent-soft",
  focusRing,
  pressScale,
  disabledState,
);

export type LanguageSwitchRowProps = {
  code: string;
  isActive: boolean;
  activeLabel: string;
  onSelect?: (code: string) => void;
  disabled?: boolean;
  className?: string;
};

export function LanguageSwitchRow({
  code,
  isActive,
  activeLabel,
  onSelect,
  disabled = false,
  className,
}: LanguageSwitchRowProps) {
  const names = languageLabel(code);

  const body = (
    <>
      <div className="min-w-0">
        <p className="text-base font-semibold text-ink">{names.endonym}</p>
        <p className="text-sm text-muted">{names.english}</p>
      </div>

      {isActive ? (
        <Chip tone="accent" className="shrink-0 border border-accent" aria-current="true">
          {activeLabel}
        </Chip>
      ) : null}
    </>
  );

  if (isActive) {
    return (
      <div
        className={cn(rowClass, "border-accent bg-accent-soft", className)}
        aria-current="true"
      >
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(interactiveRowClass, className)}
      disabled={disabled}
      onClick={() => onSelect?.(code)}
    >
      {body}
    </button>
  );
}
