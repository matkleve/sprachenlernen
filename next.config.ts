import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Runtime reads under data/ via readFileSync (method menu, language status).
  // Vercel's file tracer does not follow those paths — without this, /methods
  // shows "Could not load the method catalogue" in production. See TRAPS.md.
  outputFileTracingIncludes: {
    "/methods": ["./data/methods/**/*"],
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

export default nextConfig;
