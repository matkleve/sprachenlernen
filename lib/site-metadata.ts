import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

/** Shared site identity for metadata, robots, and sitemap. */
export const site = {
  name: "Sprachenlernen",
  description: "Evidence-driven language learning.",
} as const;

/** Routes crawlers may index — keep in sync with `app/sitemap.ts`. */
export const indexablePublicRoutes = ["/", "/languages", "/privacy"] as const;

const noIndex: Metadata["robots"] = { index: false, follow: false };

/** Merged metadata with Open Graph and Twitter defaults. */
export function buildPageMetadata(overrides: Metadata = {}): Metadata {
  const { openGraph, twitter, ...rest } = overrides;

  return {
    ...rest,
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en",
      ...openGraph,
    },
    twitter: {
      card: "summary",
      ...twitter,
    },
  };
}

export function indexablePageMetadata(overrides: Metadata = {}): Metadata {
  return buildPageMetadata(overrides);
}

export function noIndexPageMetadata(overrides: Metadata = {}): Metadata {
  return buildPageMetadata({ robots: noIndex, ...overrides });
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  if (pathname === "/") return base;
  return `${base}${pathname}`;
}
