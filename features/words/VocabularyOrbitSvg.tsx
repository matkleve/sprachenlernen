"use client";

import { copy } from "@/features/words/content";
import { languageStripes } from "@/lib/language-stripes";
import {
  annularSegmentPath,
  ORBIT_CENTER,
  ORBIT_CENTER_RADIUS,
  ORBIT_VIEW_SIZE,
  ringRadii,
  ringTrackPath,
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

function segmentFillClass(lit: OrbitLit): string {
  switch (lit) {
    case "bright":
      return "fill-success";
    case "lit":
      return "fill-accent";
    case "half":
      return "fill-accent opacity-50";
    case "ghost":
      return "fill-line opacity-35";
  }
}

function ringTrackClass(ringIndex: number): string {
  if (ringIndex <= 1) return "stroke-success opacity-40";
  if (ringIndex <= 4) return "stroke-accent opacity-35";
  return "stroke-line-strong opacity-25";
}

function segmentLabel(segment: OrbitSegment): string {
  if (segment.kind === "word") {
    const status = segment.mature
      ? copy.bucketNames.mature
      : copy.bucketNames[segment.bucket];
    return `${segment.lemma}, rank ${segment.frequencyRank}, ${status}`;
  }
  return copy.orbitAggregateLabel(segment.rankStart, segment.rankEnd, segment.wordCount);
}

function LanguageCenter({ languageCode }: { languageCode: string }) {
  const stripes = languageStripes(languageCode);
  const size = ORBIT_CENTER_RADIUS * 2;
  const third = size / 3;

  return (
    <g>
      <clipPath id={`orbit-center-clip-${languageCode}`}>
        <circle cx={ORBIT_CENTER} cy={ORBIT_CENTER} r={ORBIT_CENTER_RADIUS} />
      </clipPath>
      <g clipPath={`url(#orbit-center-clip-${languageCode})`}>
        {stripes.orientation === "horizontal" ? (
          stripes.fills.map((fill, index) => (
            <rect
              key={fill}
              x={ORBIT_CENTER - ORBIT_CENTER_RADIUS}
              y={ORBIT_CENTER - ORBIT_CENTER_RADIUS + index * third}
              width={size}
              height={third}
              className={fill}
            />
          ))
        ) : (
          stripes.fills.map((fill, index) => (
            <rect
              key={fill}
              x={ORBIT_CENTER - ORBIT_CENTER_RADIUS + index * third}
              y={ORBIT_CENTER - ORBIT_CENTER_RADIUS}
              width={third}
              height={size}
              className={fill}
            />
          ))
        )}
      </g>
      <circle
        cx={ORBIT_CENTER}
        cy={ORBIT_CENTER}
        r={ORBIT_CENTER_RADIUS}
        className="fill-none stroke-line-strong"
        strokeWidth={1}
      />
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
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={copy.orbitAriaLabel}
    >
      <g className="orbit-spin">
        {orbit.rings.map((ring) => {
          const { inner, outer } = ringRadii(ring.index);
          const slotCount = ORBIT_SLOTS_PER_RING[ring.index] ?? 20;
          return (
            <g key={ring.index}>
              <path
                d={ringTrackPath(ORBIT_CENTER, ORBIT_CENTER, inner, outer)}
                className={cn("fill-none stroke-[3]", ringTrackClass(ring.index))}
                style={{ opacity: 0.25 + ring.fillRatio * 0.55 }}
              />
              {ring.segments.map((segment) => {
                const start = slotStartAngle(ring.index, segment.slotIndex, slotCount);
                const width = slotAngularWidth(ring.index, segment.slotIndex, slotCount);
                const path = annularSegmentPath(
                  ORBIT_CENTER,
                  ORBIT_CENTER,
                  inner,
                  outer,
                  start,
                  start + width,
                );
                const selected = selectedId === segment.id;
                return (
                  <path
                    key={segment.id}
                    d={path}
                    className={cn(
                      "cursor-pointer transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      segmentFillClass(segment.lit),
                      selected && "stroke-accent stroke-2",
                    )}
                    tabIndex={0}
                    role="button"
                    aria-label={segmentLabel(segment)}
                    onClick={() => onSelect(segment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(segment);
                      }
                    }}
                  />
                );
              })}
            </g>
          );
        })}
        <LanguageCenter languageCode={languageCode} />
      </g>
    </svg>
  );
}
