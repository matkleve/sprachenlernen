/** Session key for the in-app path visited immediately before the current one. */
export const NAVIGATION_PREVIOUS_KEY = "app:navigation:previous";

/** Updated synchronously on navigation so sibling error boundaries read the right escape. */
let inMemoryPrevious: string | null = null;
let lastPath: string | null = null;

export function readNavigationPrevious(): string | null {
  if (inMemoryPrevious) return inMemoryPrevious;
  return readNavigationPreviousFromSession();
}

function readNavigationPreviousFromSession(): string | null {
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

/**
 * Call on every pathname change before siblings render (e.g. error boundaries).
 * useEffect is too late — the boundary can render in the same commit.
 */
export function advanceNavigationPath(pathname: string): void {
  if (lastPath && lastPath !== pathname) {
    inMemoryPrevious = lastPath;
    writeNavigationPrevious(lastPath);
  }
  lastPath = pathname;
}

/** @internal test hook */
export function resetNavigationHistoryForTests(): void {
  inMemoryPrevious = null;
  lastPath = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(NAVIGATION_PREVIOUS_KEY);
    } catch {
      // ignore
    }
  }
}
