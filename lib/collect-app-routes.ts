import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Walks `app/(app)/` and returns the URL path of every `page.tsx` found.
 * Route-group folders — names in parentheses — do not appear in the path.
 * Used by the gate test so a page added under `(app)` cannot ship unprotected.
 */
export function collectAppRoutes(
  dir = join(process.cwd(), "app", "(app)"),
  segments: string[] = [],
): string[] {
  const routes: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const child = join(dir, entry.name);
    const nextSegments = entry.name.startsWith("(") ? segments : [...segments, entry.name];

    if (existsSync(join(child, "page.tsx"))) {
      routes.push(nextSegments.length === 0 ? "/" : `/${nextSegments.join("/")}`);
    }

    routes.push(...collectAppRoutes(child, nextSegments));
  }

  return routes;
}
