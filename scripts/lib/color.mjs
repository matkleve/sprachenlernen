/**
 * WCAG 2.x relative-luminance contrast helpers.
 * Shared by scripts/check-contrast.mjs and lib/color.test.ts.
 */

export function parseHex(hex) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  if (full.length !== 6) throw new Error(`not a hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colors (order-independent). */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function blendChannel(fg, bg, alpha) {
  return Math.round(fg * alpha + bg * (1 - alpha));
}

/** Alpha-composite `fg` over `bg` (opaque background). */
export function composite(fgHex, bgHex, alpha) {
  const [fr, fg, fb] = parseHex(fgHex);
  const [br, bg, bb] = parseHex(bgHex);
  const ch = (f, b) => blendChannel(f, b, alpha).toString(16).padStart(2, "0");
  return `#${ch(fr, br)}${ch(fg, bg)}${ch(fb, bb)}`;
}
