import { Chip } from "@/components/ui/Chip";
import { languageLabel } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * One language in the shell switcher menu. Contract:
 * docs/specs/component/language-switch-row.md
 */

const rowClass =
  "flex w-full items-start justify-between gap-3 rounded-card border border-line bg-surface p-3 text-left transition-[background-color,border-color] duration-150 ease-out-soft";

const interactiveRowClass = cn(
  rowClass,
  "cursor-pointer hover:border-line-strong hover:bg-accent-soft",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
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
