import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

import { Destinations } from "./Destinations";
import { signOutAction } from "./actions";
import { copy } from "./content";

/**
 * The frame every signed-in screen renders inside. Contract:
 * docs/specs/feature/app-shell.md
 *
 * A Server Component: it holds nothing. The one fact that changes between
 * renders — which destination you are on — lives in the URL and is read by
 * Destinations, the single client leaf.
 *
 * Nothing here is ever handed a count. UC-063 forbids a number in the
 * navigation in every form, and the enforcement is that the data never arrives
 * rather than that somebody remembers not to render it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Destinations />
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              {copy.signOut}
            </Button>
          </form>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
