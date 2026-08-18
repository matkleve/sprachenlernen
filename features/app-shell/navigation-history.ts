/** Session key for the in-app path visited immediately before the current one. */
export const NAVIGATION_PREVIOUS_KEY = "app:navigation:previous";

export function readNavigationPrevious(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(NAVIGATION_PREVIOUS_KEY);
  } catch {
    return null;
  }
}

export function writeNavigationPrevious(path: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NAVIGATION_PREVIOUS_KEY, path);
  } catch {
    // Private mode or storage quota — escape falls back to Methods.
  }
}
