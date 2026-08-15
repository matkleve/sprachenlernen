import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-metadata";
import { routes } from "@/lib/routes";

/**
 * Crawl policy for public vs account-gated routes.
 * Contract: docs/specs/service/discovery.md
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        routes.methods,
        routes.words,
        routes.progress,
        routes.profile,
        routes.chooseLanguage,
        routes.signIn,
        routes.signUp,
        routes.authCallback,
        "/account",
        "/dev/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
