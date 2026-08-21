import { stageDetail } from "@/lib/progression-stage";

/**
 * Stable pseudo-random star positions — same stage always renders the same sky.
 * Dots sit behind content and cast no interactive hit targets.
 */
export function ProgressionStarField({ stage }: { stage: number }) {
  const { stars } = stageDetail(stage);
  if (stars === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: stars }, (_, index) => {
        const seed = stage * 997 + index * 131;
        const left = ((seed * 73) % 10000) / 100;
        const top = ((seed * 41) % 8500) / 100;
        const size = index % 5 === 0 ? 3 : 2;
        const opacity = 0.45 + (index % 4) * 0.12;

        return (
          <span
            key={index}
            className="progression-star"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}
