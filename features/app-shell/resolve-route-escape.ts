import { routes } from "@/lib/routes";

export type RouteEscapeDestination = "methods" | "words" | "progress" | "content" | "profile";

/** Strip query/hash so drill-in and destination roots resolve consistently. */
export function normalizeNavigationPath(path: string): string {
  const withoutHash = path.split("#")[0] ?? path;
  return withoutHash.split("?")[0] ?? withoutHash;
}

/**
 * Parent href for the route-escape link. Drill-in routes go to their
 * destination root — same rule as shellBackTarget.
 */
export function routeEscapeHref(previousPath: string): string {
  const path = normalizeNavigationPath(previousPath);

  if (path === routes.profile) return routes.profile;
  if (path === routes.content || path.startsWith(`${routes.content}/`)) {
    return routes.content;
  }

  for (const destination of [routes.progress, routes.words, routes.methods] as const) {
    if (path === destination || path.startsWith(`${destination}/`)) {
      return destination;
    }
  }

  return routes.appHome;
}

/** Destination label key for i18n when the previous path maps to a known surface. */
export function routeEscapeDestination(previousPath: string): RouteEscapeDestination | null {
  const path = normalizeNavigationPath(previousPath);

  if (path === routes.profile) return "profile";
  if (path === routes.content || path.startsWith(`${routes.content}/`)) return "content";
  if (path === routes.methods || path.startsWith(`${routes.methods}/`)) return "methods";
  if (path === routes.words || path.startsWith(`${routes.words}/`)) return "words";
  if (path === routes.progress || path.startsWith(`${routes.progress}/`)) return "progress";

  return null;
}
