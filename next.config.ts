import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { securityHeaders } from "./lib/security-headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Contract: docs/adr/0013-security-response-headers.md
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          isProduction: process.env.NODE_ENV === "production",
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        }),
      },
    ];
  },
  // Baked once per `next build` / dev server start — profile shows when this
  // version shipped. Contract: docs/specs/feature/app-update.md
  env: {
    NEXT_PUBLIC_APP_BUILT_AT:
      process.env.NEXT_PUBLIC_APP_BUILT_AT ?? new Date().toISOString(),
  },
  // Runtime reads under data/ via readFileSync (method menu, language status,
  // content library, adaptation cache). Vercel's file tracer follows imports,
  // not paths built at runtime — without these entries the file is absent from
  // the deployment and the route shows its error state, with nothing failing at
  // build time. /methods shipped that way once; see docs/TRAPS.md.
  //
  // This list was hand-written and drifted: /content and /content/[id] read four
  // directories between them and were never in it at all. `check:file-tracing`
  // now derives what each route needs from the import graph and fails when an
  // entry is missing, so the list below is checked rather than remembered.
  outputFileTracingIncludes: {
    "/methods": ["./data/methods/**/*", "./data/demonstration-sentences/**/*"],
    "/methods/[id]": [
      "./data/methods/**/*",
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
      "./data/adaptations/**/*",
    ],
    "/content": [
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
      "./data/adaptations/**/*",
    ],
    "/content/[id]": [
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
      "./data/adaptations/**/*",
    ],
    "/practice": [
      "./data/methods/**/*",
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
      "./data/example-sentences/**/*",
      "./data/starter/**/*",
    ],
    "/words": [
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
    ],
    "/words/review": [
      "./data/methods/**/*",
      "./data/example-sentences/**/*",
      "./data/starter/**/*",
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
    ],
    "/words-bisect": [
      "./data/content/**/*",
      "./data/languages/**/*",
      "./data/frequency/**/*",
      "./data/lemma/**/*",
    ],
    "/languages": ["./data/languages/**/*", "./data/frequency/**/*"],
    "/dev/progression": ["./data/design-themes/**/*"],
    "/profile/dev/sentence-realizer": [
      "./data/sentence-plans/**/*",
      "./data/lemma/**/*",
    ],
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
