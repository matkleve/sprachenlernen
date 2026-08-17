"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import type { AtlasPoint } from "@/lib/vocabulary-snapshot";

type OrbitListPopoverProps = {
  open: boolean;
  onClose: () => void;
  atlas: readonly AtlasPoint[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onSelectWord: (point: AtlasPoint) => void;
};

export function OrbitListPopover({
  open,
  onClose,
  atlas,
  triggerRef,
  onSelectWord,
}: OrbitListPopoverProps) {
  const t = useTranslations("words");
  const popoverRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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
  const top = rect ? rect.bottom + 8 : 80;
  const left = rect ? Math.min(rect.left, window.innerWidth - 360) : 16;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-labelledby={titleId}
      className="fixed z-[var(--z-index-language-switcher-menu)] max-h-[min(70vh,28rem)] w-[min(100vw-2rem,24rem)] overflow-hidden rounded-card border border-line bg-surface-raised shadow-raised"
      style={{ top, left }}
    >
      <div className="border-b border-line px-4 py-3">
        <h3 id={titleId} className="text-sm font-semibold text-ink">
          {t("orbitListTitle")}
        </h3>
        <p className="mt-1 text-xs text-muted">{t("orbitListCaption")}</p>
      </div>
      <div className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
        <Table caption={t("orbitListTitle")}>
          <thead>
            <tr>
              <Th scope="col">{t("atlasColumns.word")}</Th>
              <Th scope="col">{t("atlasColumns.rank")}</Th>
              <Th scope="col">{t("atlasColumns.status")}</Th>
            </tr>
          </thead>
          <tbody>
            {atlas.map((point) => (
              <tr key={`${point.lemma}-${point.frequencyRank}`}>
                <Th scope="row">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-full justify-start px-1 py-0.5 font-medium text-ink"
                    onClick={() => {
                      onSelectWord(point);
                      onClose();
                    }}
                  >
                    {point.lemma}
                  </Button>
                </Th>
                <Td>{point.frequencyRank}</Td>
                <Td>
                  {point.mature ? t("bucketNames.mature") : t(`bucketNames.${point.bucket}`)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>,
    document.body,
  );
}
