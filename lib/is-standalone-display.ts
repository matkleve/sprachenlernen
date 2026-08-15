/**
 * True when the app runs outside the browser tab chrome (Home Screen / installed PWA).
 * iOS exposes `navigator.standalone`; standards use `display-mode`.
 */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}
