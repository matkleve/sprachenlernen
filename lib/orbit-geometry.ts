/**
 * SVG annular paths for the vocabulary orbit.
 */

export const ORBIT_VIEW_SIZE = 400;
export const ORBIT_CENTER = ORBIT_VIEW_SIZE / 2;
export const ORBIT_CENTER_RADIUS = 24;
export const ORBIT_RING_WIDTH = 11;
export const ORBIT_RING_GAP = 3;

export function ringRadii(ringIndex: number): { inner: number; outer: number } {
  const inner = ORBIT_CENTER_RADIUS + 6 + ringIndex * (ORBIT_RING_WIDTH + ORBIT_RING_GAP);
  return { inner, outer: inner + ORBIT_RING_WIDTH };
}

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function annularSegmentPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startDeg: number,
  endDeg: number,
): string {
  const span = endDeg - startDeg;
  const largeArc = span > 180 ? 1 : 0;
  const startOuter = polar(cx, cy, outerRadius, startDeg);
  const endOuter = polar(cx, cy, outerRadius, endDeg);
  const startInner = polar(cx, cy, innerRadius, endDeg);
  const endInner = polar(cx, cy, innerRadius, startDeg);

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export function ringTrackPath(cx: number, cy: number, inner: number, outer: number): string {
  return annularSegmentPath(cx, cy, inner, outer, 0, 359.9);
}
