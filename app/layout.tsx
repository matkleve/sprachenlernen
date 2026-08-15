import type { Metadata, Viewport } from "next";

import { CookieConsent } from "@/features/privacy/CookieConsent";
import { fontClassNames } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  // Was "Grundriss". Every page inherited the starter's name, which is the same
  // defect T-04 exists to fix one level up from the home route.
  title: { default: "Sprachenlernen", template: "%s · Sprachenlernen" },
  description: "Evidence-driven language learning.",
  appleWebApp: {
    capable: true,
    title: "Sprachenlernen",
  },
};

export const viewport: Viewport = {
  // These must be literal hex: Next emits them as a <meta> tag that the browser
  // reads before any CSS loads, so `var(--color-canvas)` would resolve to
  // nothing. They are the one place a token value is legitimately duplicated —
  // and check-tokens asserts they still equal --color-canvas in each theme, so
  // the duplication cannot drift.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" }, // token-check-ignore: mirrors --color-canvas (light)
    { media: "(prefers-color-scheme: dark)", color: "#1c1814" }, // token-check-ignore: mirrors --color-canvas (dark)
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames}>
      <body>
        {/* Visible only on keyboard focus. Without it, every keyboard user tabs
            through the whole header on every page before reaching content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow-raised"
        >
          Skip to content
        </a>
        {/* `#main` lives in each route group's layout — marketing on the page,
            signed-in on the shell's content below the header — so the skip link
            never lands inside navigation. */}
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
