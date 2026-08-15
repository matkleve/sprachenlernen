"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ReflectionDeckCard = {
  id: string;
  headline: string;
  visual: React.ReactNode;
  derivationHref?: string;
};

export type ReflectionDeckCopy = {
  close: string;
  previous: string;
  next: string;
  seeData: string;
  cardStatus: (index: number, total: number) => string;
};

type ReflectionDeckProps = {
  open: boolean;
  onClose: () => void;
  periodLabel: string;
  cards: readonly ReflectionDeckCard[];
  copy: ReflectionDeckCopy;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const SWIPE_THRESHOLD_PX = 48;

/**
 * Swipeable reflection card stack. Contract: docs/specs/component/reflection-deck.md
 */
export function ReflectionDeck({
  open,
  onClose,
  periodLabel,
  cards,
  copy,
  triggerRef,
}: ReflectionDeckProps) {
  const router = useRouter();
  const titleId = useId();
  const deckRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  const total = cards.length;
  const atStart = index === 0;
  const atEnd = index === total - 1;
  const active = cards[index];

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      setLiveMessage(copy.cardStatus(clamped + 1, total));
      setDragX(0);
    },
    [copy, total],
  );

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setDragX(0);
    setLiveMessage(copy.cardStatus(1, total));
    closeButtonRef.current?.focus();
  }, [open, copy, total]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && !atEnd) goTo(index + 1);
      if (event.key === "ArrowLeft" && !atStart) goTo(index - 1);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef?.current?.contains(target) || deckRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, triggerRef, atEnd, atStart, goTo, index]);

  const onPointerDownCard = (event: React.PointerEvent) => {
    dragStartX.current = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMoveCard = (event: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    setDragX(event.clientX - dragStartX.current);
  };

  const onPointerUpCard = () => {
    if (dragStartX.current === null) return;
    if (dragX <= -SWIPE_THRESHOLD_PX && !atEnd) goTo(index + 1);
    else if (dragX >= SWIPE_THRESHOLD_PX && !atStart) goTo(index - 1);
    else setDragX(0);
    dragStartX.current = null;
  };

  const onSeeData = () => {
    const href = active?.derivationHref;
    onClose();
    if (href) router.push(href);
  };

  if (!open || typeof document === "undefined" || !active) return null;

  return createPortal(
    <div ref={deckRef}>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="language-switcher-scrim fixed inset-0 z-language-switcher-scrim"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-labelledby={titleId}
        className="fixed inset-x-4 top-1/2 z-language-switcher-menu max-h-[min(85vh,36rem)] w-[min(100vw-2rem,28rem)] -translate-y-1/2 overflow-hidden rounded-card border border-line bg-surface-raised shadow-raised sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-ink">
            {periodLabel}
          </h2>
          <Button ref={closeButtonRef} type="button" variant="ghost" size="sm" onClick={onClose}>
            {copy.close}
          </Button>
        </div>

        <p className="sr-only" aria-live="polite">
          {liveMessage}
        </p>

        <div
          className="touch-pan-y px-4 py-5"
          onPointerDown={onPointerDownCard}
          onPointerMove={onPointerMoveCard}
          onPointerUp={onPointerUpCard}
          onPointerCancel={onPointerUpCard}
          style={{ transform: dragX ? `translateX(${dragX}px)` : undefined }}
        >
          <p className="text-lg font-medium leading-snug text-ink">{active.headline}</p>
          <div className="mt-5 min-h-32">{active.visual}</div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            {cards.map((card, dotIndex) => (
              <span
                key={card.id}
                className={cn(
                  "size-2 rounded-full",
                  dotIndex === index ? "bg-accent" : "bg-line-strong",
                )}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={atStart}
              onClick={() => goTo(index - 1)}
            >
              {copy.previous}
            </Button>

            {atEnd && active.derivationHref ? (
              <Button type="button" variant="primary" size="sm" onClick={onSeeData}>
                {copy.seeData}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={atEnd}
                onClick={() => goTo(index + 1)}
              >
                {copy.next}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
