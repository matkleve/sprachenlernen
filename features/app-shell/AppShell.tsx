import type { ReactNode } from "react";

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
}: {
  children: ReactNode;
  languages: readonly LanguageSwitcherOption[];
}) {
  return (
    <div className="min-h-dvh">
      <DesktopShellHeader languages={languages} />

      <FloatingShellChrome languages={languages} />

      <main
        id="main"
        className={cn(
          "pt-shell-float-top pb-shell-float-bottom md:pt-0 md:pb-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
