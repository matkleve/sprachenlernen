import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Baked once per `next build` / dev server start — profile shows when this
  // version shipped. Contract: docs/specs/feature/app-update.md
  env: {
    NEXT_PUBLIC_APP_BUILT_AT:
      process.env.NEXT_PUBLIC_APP_BUILT_AT ?? new Date().toISOString(),
  },
  // Runtime reads under data/ via readFileSync (method menu, language status).
  // Vercel's file tracer does not follow those paths — without this, /methods
  // shows "Could not load the method catalogue" in production. See TRAPS.md.
  outputFileTracingIncludes: {
    "/methods": ["./data/methods/**/*", "./data/demonstration-sentences/**/*"],
    "/methods/[id]": ["./data/methods/**/*"],
    "/words": [
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
    ],
    "/words/review": ["./data/methods/**/*"],
    "/languages": ["./data/languages/**/*"],
  },
  // `verify` sets this so its build cannot overwrite the `.next` a running dev
  // server is serving from. That collision empties the stylesheet and presents
  // as a CSS bug — see docs/TRAPS.md. Deploys leave it unset and get `.next`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Type and lint errors fail the build on purpose. A build that passes while
  // the types are broken is a build that tells you nothing.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
