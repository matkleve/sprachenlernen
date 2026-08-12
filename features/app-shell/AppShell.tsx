import type { ReactNode } from "react";

import type { LanguageHoldings } from "@/lib/db/language-holdings";
import { cn } from "@/lib/utils";

import { DesktopShellHeader } from "./DesktopShellHeader";
import { FloatingShellChrome } from "./FloatingShellChrome";
import type { LanguageSwitcherOption } from "./LanguageSwitcher";

/**
 * The frame every signed-in screen renders inside. Contract:
 * docs/specs/feature/app-shell.md, docs/specs/feature/mobile-nav-v2.md
 *
 * A Server Component: it holds nothing. The one fact that changes between
 * renders — which destination you are on — lives in the URL and is read by
 * Destinations and FloatingShellChrome, the client leaves.
 *
 * Nothing here is ever handed a count. UC-063 forbids a number in the
 * navigation in every form, and the enforcement is that the data never arrives
 * rather than that somebody remembers not to render it.
 */
export function AppShell({
  children,
  languages,
  languageHoldings,
}: {
  children: ReactNode;
  languages: readonly LanguageSwitcherOption[];
  languageHoldings?: Record<string, LanguageHoldings>;
}) {
  return (
    <div className="min-h-dvh">
      <DesktopShellHeader languages={languages} languageHoldings={languageHoldings} />

      <FloatingShellChrome languages={languages} languageHoldings={languageHoldings} />

      <main
        id="main"
        className={cn(
          "pt-[var(--shell-float-top-active)] pb-shell-float-bottom md:pt-0 md:pb-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
