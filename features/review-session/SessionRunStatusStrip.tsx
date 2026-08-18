"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import type { RunSegment, RunSegmentStatus } from "@/lib/review-session-run-status";
import { layoutShiftMotion } from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<RunSegmentStatus, string> = {
  pending: "bg-line",
  current: "bg-accent",
  again: "bg-grade-again-deep",
  hard: "bg-grade-hard-deep",
  requeued: "bg-success-soft",
  done: "bg-success-deep",
};

type SessionRunStatusStripProps = {
  segments: RunSegment[];
  className?: string;
};

export function SessionRunStatusStrip({ segments, className }: SessionRunStatusStripProps) {
  const t = useTranslations("reviewSession");
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    for (const [taskId, element] of itemRefs.current) {
      nextRects.set(taskId, element.getBoundingClientRect());
    }

    for (const [taskId, element] of itemRefs.current) {
      const previous = prevRects.current.get(taskId);
      const next = nextRects.get(taskId);
      if (!previous || !next) continue;

      const deltaX = previous.left - next.left;
      if (Math.abs(deltaX) < 0.5) continue;

      element.style.transform = `translateX(${deltaX}px)`;
      element.style.transition = "none";

      requestAnimationFrame(() => {
        element.style.transition = "";
        element.style.transform = "";
      });
    }

    prevRects.current = nextRects;
  }, [segments]);

  if (segments.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn("flex w-full gap-1", className)}
      role="list"
      aria-label={t("runStatusLabel")}
    >
      {segments.map((segment) => (
        <div
          key={segment.taskId}
          ref={(element) => {
            if (element) itemRefs.current.set(segment.taskId, element);
            else itemRefs.current.delete(segment.taskId);
          }}
          role="listitem"
          aria-hidden
          className={cn(
            "h-1.5 min-w-0 flex-1 rounded-sm transition-colors duration-300 ease-out-soft",
            layoutShiftMotion,
            STATUS_CLASS[segment.status],
          )}
        />
      ))}
    </div>
  );
}
