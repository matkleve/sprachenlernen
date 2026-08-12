import { UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { ActionLink } from "@/components/ui/ActionLink";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { Destinations } from "./Destinations";
import { FloatingShellChrome } from "./FloatingShellChrome";
import { LanguageSwitcher, type LanguageSwitcherOption } from "./LanguageSwitcher";
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
export function AppShell({
  children,
  languages,
}: {
  children: ReactNode;
  languages: readonly LanguageSwitcherOption[];
}) {
  return (
    <div className="min-h-dvh">
      <header className="hidden border-b border-line bg-surface md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <LanguageSwitcher languages={languages} layout="inline" />
            <Destinations />
          </div>
          {/* Same affordance as the mobile corner chip: the account is a link,
              and sign out lives inside it on /profile (ADR-0009). */}
          <ActionLink href={routes.profile} variant="ghost" size="sm" className="gap-1.5">
            <UserRound aria-hidden className="size-4 shrink-0" />
            {copy.account}
          </ActionLink>
        </div>
      </header>

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
