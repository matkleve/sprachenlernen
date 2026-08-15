"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { ReflectionDeck } from "@/components/ui/ReflectionDeck";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ReflectionCardModel, WeeklyReflectionModel } from "@/lib/weekly-reflection";

import { markReflectionSeenAction } from "./actions";
import { weeklyReflectionCopy } from "./content";
import { ReflectionVisual } from "./ReflectionVisual";

type WeeklyReflectionEntryProps = {
  reflection: Exclude<WeeklyReflectionModel, { status: "hidden" }>;
};

/**
 * Progress entry row + deck. Contract: docs/specs/feature/weekly-reflection.md
 */
export function WeeklyReflectionEntry({ reflection }: WeeklyReflectionEntryProps) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(reflection.unread);
  const [pending, startTransition] = useTransition();

  const cards = reflection.cards.map((card) => toDeckCard(card));

  const onClose = () => {
    setOpen(false);
    if (!unread) return;

    startTransition(async () => {
      await markReflectionSeenAction(reflection.isoWeek, reflection.languageCode);
      setUnread(false);
      router.refresh();
    });
  };

  return (
    <section className="mt-page-content" aria-labelledby="weekly-reflection-heading">
      <h2 id="weekly-reflection-heading" className="text-xl font-semibold text-ink">
        {weeklyReflectionCopy.periodLabel}
      </h2>

      <Button
        ref={triggerRef}
        type="button"
        variant="secondary"
        pending={pending}
        pendingPolicy="nav"
        disabled={pending}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={weeklyReflectionCopy.rowLabel}
        className={cn(
          "mt-4 h-auto w-full max-w-2xl justify-between gap-3 rounded-card px-4 py-4 text-left whitespace-normal",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="text-base font-normal leading-relaxed text-ink">{reflection.teaser}</span>
        {unread ? (
          <span
            className="size-2.5 shrink-0 rounded-full bg-accent"
            aria-label={weeklyReflectionCopy.unreadLabel}
          />
        ) : null}
      </Button>

      <ReflectionDeck
        open={open}
        onClose={onClose}
        periodLabel={weeklyReflectionCopy.periodLabel}
        cards={cards}
        triggerRef={triggerRef}
        copy={{
          close: weeklyReflectionCopy.close,
          previous: weeklyReflectionCopy.previous,
          next: weeklyReflectionCopy.next,
          seeData: weeklyReflectionCopy.seeData,
          cardStatus: weeklyReflectionCopy.cardStatus,
        }}
      />
    </section>
  );
}

function toDeckCard(card: ReflectionCardModel) {
  return {
    id: card.id,
    headline: card.headline,
    visual: <ReflectionVisual visual={card.visual} />,
    derivationHref: card.derivationHref,
  };
}
