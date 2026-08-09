"use client";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import {
  borderWeightClass,
  themeScopeStyle,
  type DesignThemePreset,
} from "@/lib/design-themes";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { themeBodyFontClass, themeDisplayFontClass } from "./fonts";

type ThemePreviewCanvasProps = {
  preset: DesignThemePreset;
};

function ThemePreviewCanvas({ preset }: ThemePreviewCanvasProps) {
  const displayFont = themeDisplayFontClass(preset.id);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-4 p-5",
        themeBodyFontClass(preset.id),
        borderWeightClass(preset.borderWeight),
      )}
      style={themeScopeStyle(preset.tokens)}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.preview.heading}
      </p>

      <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={cn("text-base font-semibold text-ink", displayFont)}>
              {page.preview.cardTitle}
            </h3>
            <p className="mt-1 text-sm text-muted">{page.preview.cardBody}</p>
          </div>
          <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-ink">
            {page.preview.badge}
          </span>
        </div>
      </div>

      <Field label={page.preview.fieldLabel}>
        <Input placeholder={page.preview.fieldPlaceholder} readOnly />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button size="sm">{page.preview.primary}</Button>
        <Button size="sm" variant="secondary">
          {page.preview.secondary}
        </Button>
        <Button size="sm" variant="ghost">
          {page.preview.ghost}
        </Button>
      </div>
    </div>
  );
}

type ThemePreviewProps = {
  preset: DesignThemePreset;
  selected: boolean;
  onChoose: () => void;
};

export function ThemePreview({ preset, selected, onChoose }: ThemePreviewProps) {
  const displayFont = themeDisplayFontClass(preset.id);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border bg-surface shadow-soft transition-[border-color,box-shadow] duration-150 ease-out-soft",
        selected ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-canvas" : "border-line",
      )}
    >
      <header className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={cn("text-lg font-semibold text-ink", displayFont)}>{preset.name}</h2>
            <p className="mt-1 text-sm text-muted">{preset.tagline}</p>
          </div>
          {selected ? (
            <span className="rounded-pill bg-accent-soft px-3 py-1 text-xs font-medium text-ink">
              {page.chosenLabel}
            </span>
          ) : null}
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          <li className="rounded-pill border border-line bg-canvas px-2.5 py-1 text-xs text-muted">
            {page.chips.font}: {preset.fontLabel}
          </li>
          <li className="rounded-pill border border-line bg-canvas px-2.5 py-1 text-xs text-muted">
            {page.chips.radius}: {preset.radiusLabel}
          </li>
          <li className="rounded-pill border border-line bg-canvas px-2.5 py-1 text-xs text-muted">
            {page.chips.border}: {preset.borderLabel}
          </li>
        </ul>

        <p className="mt-3 text-sm leading-relaxed text-muted">{preset.rationale}</p>
      </header>

      <ThemePreviewCanvas preset={preset} />

      <footer className="border-t border-line px-5 py-4">
        <Button
          className="w-full"
          variant={selected ? "secondary" : "primary"}
          onClick={onChoose}
          aria-pressed={selected}
        >
          {selected ? page.chosenLabel : page.chooseLabel}
        </Button>
      </footer>
    </article>
  );
}
