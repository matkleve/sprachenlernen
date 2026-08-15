/**
 * True when the app runs from the Home Screen / installed web app (not a Safari tab).
 * iOS: navigator.standalone. Standards: display-mode.
 */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  const matchMedia = typeof window.matchMedia === "function" ? window.matchMedia : null;

  return (
    navigatorWithStandalone.standalone === true ||
    matchMedia?.("(display-mode: standalone)").matches === true ||
    matchMedia?.("(display-mode: fullscreen)").matches === true
  );
}
