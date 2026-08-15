"use client";

import type { CSSProperties } from "react";

import { copy } from "@/features/words/content";
import { languageStripes } from "@/lib/language-stripes";
import {
  ORBIT_BADGE_RADIUS,
  ORBIT_CENTER,
  ORBIT_CENTER_RADIUS,
  ORBIT_RING_WIDTH,
  ORBIT_VIEW_SIZE,
  ringMidRadius,
  strokeArcPath,
} from "@/lib/orbit-geometry";
import {
  ORBIT_SLOTS_PER_RING,
  slotAngularWidth,
  slotStartAngle,
  type OrbitLit,
  type OrbitSegment,
  type VocabularyOrbit,
} from "@/lib/vocabulary-orbit";
import { cn } from "@/lib/utils";

const CENTER = ORBIT_CENTER;

function segmentStrokeClass(lit: OrbitLit, kind: OrbitSegment["kind"]): string {
  if (kind === "tick") return "stroke-line opacity-20";
  switch (lit) {
    case "bright":
      return "stroke-ink";
    case "lit":
      return "stroke-ink opacity-90";
    case "half":
      return "stroke-muted opacity-70";
    case "ghost":
      return "stroke-line opacity-35";
  }
}

function segmentLabel(segment: OrbitSegment): string {
  if (segment.kind === "tick") return "";
  if (segment.kind === "word") {
    const status = segment.mature
      ? copy.bucketNames.mature
      : copy.bucketNames[segment.bucket];
    return `${segment.lemma}, rank ${segment.frequencyRank}, ${status}`;
  }
  return copy.orbitAggregateLabel(segment.rankStart, segment.rankEnd, segment.wordCount);
}

function ringSpinStyle(ringIndex: number): CSSProperties {
  const duration = 75 + ringIndex * 18;
  const direction = ringIndex % 2 === 0 ? "orbit-ring-forward" : "orbit-ring-reverse";
  return {
    transformOrigin: `${CENTER}px ${CENTER}px`,
    animationName: direction,
    animationDuration: `${duration}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  };
}

function LanguageCenter({ languageCode }: { languageCode: string }) {
  const stripes = languageStripes(languageCode);
  const badgeSize = ORBIT_BADGE_RADIUS * 2;
  const band = badgeSize / 3;

  return (
    <g>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={ORBIT_CENTER_RADIUS}
        className="fill-surface stroke-line"
        strokeWidth={1}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={ORBIT_BADGE_RADIUS + 2}
        fill="none"
        className="stroke-line opacity-50"
        strokeWidth={1}
      />
      <clipPath id={`orbit-center-clip-${languageCode}`}>
        <circle cx={CENTER} cy={CENTER} r={ORBIT_BADGE_RADIUS} />
      </clipPath>
      <g clipPath={`url(#orbit-center-clip-${languageCode})`}>
        {stripes.orientation === "horizontal" ? (
          stripes.fills.map((fill, index) => (
            <rect
              key={fill}
              x={CENTER - ORBIT_BADGE_RADIUS}
              y={CENTER - ORBIT_BADGE_RADIUS + index * band}
              width={badgeSize}
              height={band}
              className={fill}
            />
          ))
        ) : (
          stripes.fills.map((fill, index) => (
            <rect
              key={fill}
              x={CENTER - ORBIT_BADGE_RADIUS + index * band}
              y={CENTER - ORBIT_BADGE_RADIUS}
              width={band}
              height={badgeSize}
              className={fill}
            />
          ))
        )}
      </g>
    </g>
  );
}

type RingLayerProps = {
  ringIndex: number;
  segments: readonly OrbitSegment[];
  selectedId: string | null;
  onSelect: (segment: OrbitSegment) => void;
};

function RingLayer({ ringIndex, segments, selectedId, onSelect }: RingLayerProps) {
  const mid = ringMidRadius(ringIndex);
  const slotCount = ORBIT_SLOTS_PER_RING[ringIndex] ?? 40;

  return (
    <g className="orbit-ring" style={ringSpinStyle(ringIndex)}>
      {segments.map((segment) => {
        const start = slotStartAngle(ringIndex, segment.slotIndex, slotCount);
        const width = slotAngularWidth(ringIndex, segment.slotIndex, slotCount);
        const end = start + width;
        const path = strokeArcPath(CENTER, CENTER, mid, start, end);
        const interactive = segment.kind !== "tick";
        const selected = selectedId === segment.id;

        return (
          <g
            key={segment.id}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            className={cn(
              interactive &&
                "group orbit-segment cursor-pointer outline-none focus:outline-none focus-visible:outline-none",
            )}
            aria-label={interactive ? segmentLabel(segment) : undefined}
            onClick={interactive ? () => onSelect(segment) : undefined}
            onKeyDown={
              interactive
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(segment);
                    }
                  }
                : undefined
            }
          >
            <path
              d={path}
              fill="none"
              className={cn(
                segmentStrokeClass(segment.lit, segment.kind),
                (selected || false) && "stroke-accent",
                interactive && "pointer-events-none group-focus-visible:stroke-accent",
              )}
              strokeWidth={selected ? ORBIT_RING_WIDTH + 2 : ORBIT_RING_WIDTH}
              strokeLinecap="round"
              pointerEvents="none"
            />
            {interactive ? (
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                strokeLinecap="round"
                pointerEvents="stroke"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

type VocabularyOrbitSvgProps = {
  orbit: VocabularyOrbit;
  languageCode: string;
  selectedId: string | null;
  onSelect: (segment: OrbitSegment) => void;
};

export function VocabularyOrbitSvg({
  orbit,
  languageCode,
  selectedId,
  onSelect,
}: VocabularyOrbitSvgProps) {
  return (
    <svg
      viewBox={`0 0 ${ORBIT_VIEW_SIZE} ${ORBIT_VIEW_SIZE}`}
      className="mx-auto w-full max-w-[min(100%,42rem)]"
      role="img"
      aria-label={copy.orbitAriaLabel}
    >
      {orbit.rings.map((ring) => (
        <RingLayer
          key={ring.index}
          ringIndex={ring.index}
          segments={ring.segments}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
      <LanguageCenter languageCode={languageCode} />
    </svg>
  );
}
