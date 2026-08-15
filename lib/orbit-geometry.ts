/**
 * SVG annular paths for the vocabulary orbit.
 */

export const ORBIT_VIEW_SIZE = 400;
export const ORBIT_CENTER = ORBIT_VIEW_SIZE / 2;
export const ORBIT_CENTER_RADIUS = 28;
/** Stroke thickness for each ring band. */
export const ORBIT_RING_WIDTH = 7;
export const ORBIT_RING_GAP = 6;

export function ringRadii(ringIndex: number): { inner: number; outer: number } {
  const inner = ORBIT_CENTER_RADIUS + 8 + ringIndex * (ORBIT_RING_WIDTH + ORBIT_RING_GAP);
  return { inner, outer: inner + ORBIT_RING_WIDTH };
}

export function ringMidRadius(ringIndex: number): number {
  const { inner, outer } = ringRadii(ringIndex);
  return (inner + outer) / 2;
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

/** Rounded-cap dash sitting on the ring midline — the App Clip segment shape. */
export function strokeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const span = endDeg - startDeg;
  const largeArc = span > 180 ? 1 : 0;
  const start = polar(cx, cy, radius, startDeg);
  const end = polar(cx, cy, radius, endDeg);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Wider invisible hit stroke for rounded-dash taps. */
export function strokeHitPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  return strokeArcPath(cx, cy, radius, startDeg, endDeg);
}
