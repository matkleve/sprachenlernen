"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FilterPill } from "@/components/ui/FilterPill";
import { Textarea } from "@/components/ui/Input";
import { copy } from "@/features/review-session/content";
import {
  REPORT_CATEGORIES,
  REPORT_NOTE_MAX_LENGTH,
  normalizeReportNote,
  type ReportCardInput,
  type ReportCategory,
} from "@/lib/card-report";

type CardReportPopoverProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ReportCardInput) => Promise<void>;
  pending?: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Optional report details during review (UC-073). Contract:
 * docs/specs/feature/review-card-report.md
 */
export function CardReportPopover({
  open,
  onClose,
  onSubmit,
  pending = false,
  triggerRef,
}: CardReportPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setCategory(null);
      setNote("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, triggerRef]);

  if (!open || typeof document === "undefined") return null;

  const rect = triggerRef.current?.getBoundingClientRect();
  const width = Math.min(320, window.innerWidth - 32);
  const top = rect ? rect.bottom + 8 : 80;
  const left = rect
    ? Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16))
    : 16;

  const toggleCategory = (value: ReportCategory) => {
    setCategory((current) => (current === value ? null : value));
  };

  const handleSubmit = async () => {
    await onSubmit({
      category,
      note: normalizeReportNote(note),
    });
  };

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-labelledby={titleId}
      className="fixed z-[var(--z-index-language-switcher-menu)] w-[min(100vw-2rem,20rem)] rounded-card border border-line bg-surface-raised p-4 shadow-raised"
      style={{ top, left, width }}
    >
      <h3 id={titleId} className="text-sm font-semibold text-ink">
        {copy.reportPopoverTitle}
      </h3>
      <p className="mt-1 text-xs text-muted">{copy.reportPopoverOutcome}</p>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-xs font-medium text-muted">{copy.reportCategoryLegend}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {REPORT_CATEGORIES.map((value) => (
            <FilterPill
              key={value}
              current={category === value}
              onClick={() => toggleCategory(value)}
              className="text-xs"
            >
              {copy.reportCategories[value]}
            </FilterPill>
          ))}
        </div>
      </fieldset>

      <Field label={copy.reportNoteLabel} className="mt-4">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value.slice(0, REPORT_NOTE_MAX_LENGTH))}
          rows={3}
          placeholder={copy.reportNotePlaceholder}
        />
      </Field>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>
          {copy.reportCancel}
        </Button>
        <Button type="button" size="sm" pending={pending} onClick={() => void handleSubmit()}>
          {copy.reportSubmit}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
