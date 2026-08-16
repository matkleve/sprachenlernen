import type { MetadataRoute } from "next";

import { site } from "@/lib/site-metadata";

/**
 * Web app manifest — standalone scope for all signed-in routes.
 * Contract: docs/study/31-ios-safari-pwa-test-report.md § PWA install.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f4ef", // token-check-ignore: mirrors --color-canvas (light)
    theme_color: "#f7f4ef", // token-check-ignore: mirrors --color-canvas (light)
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
