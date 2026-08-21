import { materialRecipeForStage } from "@/lib/material-recipes";

/** Observatory environmental light — stars as light sources. */
export function MaterialStarField({ stage }: { stage: number }) {
  const { stars } = materialRecipeForStage(stage);
  if (stars <= 0) return null;

  const positions = starPositions(stars);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {positions.map((pos, index) => (
        <span
          key={index}
          className="material-star"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${pos.size}px`,
            height: `${pos.size}px`,
            opacity: pos.opacity,
          }}
        />
      ))}
    </div>
  );
}

type StarPosition = { x: number; y: number; size: number; opacity: number };

/** Deterministic star layout — same stage always produces the same sky. */
function starPositions(count: number): StarPosition[] {
  const positions: StarPosition[] = [];
  let seed = count * 7919;

  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const x = (seed % 9000) / 100;
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const y = (seed % 4500) / 100;
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const size = 1.5 + (seed % 300) / 100;
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const opacity = 0.4 + (seed % 600) / 1000;

    positions.push({ x, y, size, opacity });
  }

  return positions;
}
