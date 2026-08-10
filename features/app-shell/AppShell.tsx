import type { ReactNode } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/utils";

import { Destinations } from "./Destinations";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { signOutAction } from "./actions";
import { copy } from "./content";

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
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="hidden border-b border-line bg-surface md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Destinations />
          <form action={signOutAction}>
            <SubmitButton variant="ghost" size="sm">
              {copy.signOut}
            </SubmitButton>
          </form>
        </div>
      </header>

      <FloatingShellChrome />

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
