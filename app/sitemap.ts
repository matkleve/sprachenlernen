import type { MetadataRoute } from "next";

import { absoluteUrl, indexablePublicRoutes } from "@/lib/site-metadata";

/**
 * Indexable public URLs only — no auth or app routes.
 * Contract: docs/specs/service/discovery.md
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return indexablePublicRoutes.map((pathname) => ({
    url: absoluteUrl(pathname),
    lastModified,
    changeFrequency: pathname === "/" ? "monthly" : pathname === "/languages" ? "weekly" : "yearly",
    priority: pathname === "/" ? 1 : pathname === "/languages" ? 0.8 : 0.3,
  }));
}
