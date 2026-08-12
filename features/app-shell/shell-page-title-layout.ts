export const MOBILE_TITLE_LARGE_PX = 24;
export const MOBILE_TITLE_SMALL_PX = 14;
export const MOBILE_TITLE_LARGE_MAX_REM = 11;
export const MOBILE_TITLE_SMALL_MAX_REM = 9;
/** Space reserved for corner chips + horizontal padding when centering on the viewport. */
export const MOBILE_TITLE_SIDE_RESERVE_REM = 7;

/** True when scroll height exceeds one line at the large mobile title size. */
export function mobileTitleWrapsTwoLines(scrollHeight: number, lineHeight: number): boolean {
  return scrollHeight > lineHeight * 1.4;
}

/** Interpolate between scroll rest (0) and collapsed (1). */
export function shellHeaderCollapseValue(scrollY: number, range: number): number {
  return Math.min(1, Math.max(0, scrollY / range));
}

export function shellTitleFontSize(largePx: number, smallPx: number, collapse: number): number {
  return largePx + (smallPx - largePx) * collapse;
}

/**
 * When a title wraps to two lines at rest, scale max width with font size so
 * line breaks stay stable while the title shrinks on scroll.
 */
export function mobileShellTitleMaxWidth(
  wrapsTwoLines: boolean,
  fontSizePx: number,
  collapse: number,
): string {
  if (wrapsTwoLines) {
    const rem = (MOBILE_TITLE_LARGE_MAX_REM * fontSizePx) / MOBILE_TITLE_LARGE_PX;
    return `${rem}rem`;
  }

  const rem =
    MOBILE_TITLE_LARGE_MAX_REM +
    (MOBILE_TITLE_SMALL_MAX_REM - MOBILE_TITLE_LARGE_MAX_REM) * collapse;
  return `${rem}rem`;
}

export function desktopShellTitleMaxWidth(collapse: number): string {
  const vw = 70 + (52 - 70) * collapse;
  const rem = 20 + (14 - 20) * collapse;
  return `min(${vw}vw, ${rem}rem)`;
}

/** Clamp title width so it cannot overlap the corner chips when viewport-centered. */
export function mobileShellTitleClampedMaxWidth(maxWidth: string): string {
  return `min(${maxWidth}, calc(100vw - ${MOBILE_TITLE_SIDE_RESERVE_REM}rem))`;
}
