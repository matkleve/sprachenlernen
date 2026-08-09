import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { copy } from "./content";

/**
 * The signed-out view of `/`. Contract: docs/specs/page/landing.md
 *
 * A Server Component: the signed-in redirect lives in the page, not here, so
 * this stays testable without mocking the router.
 */
export function LandingHero() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-page-top pb-page-bottom">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        {copy.landing.eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {copy.landing.headline}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{copy.landing.subhead}</p>

      <div className="mt-page-content flex flex-wrap items-center gap-3">
        <Link
          href={routes.signUp}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
        >
          {copy.landing.primaryCta}
        </Link>
        <Link
          href={routes.signIn}
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
        >
          {copy.landing.secondaryCta}
        </Link>
      </div>

      <section
        aria-labelledby="landing-pillars"
        className="mt-page-content rounded-card border border-line bg-surface p-6 shadow-soft"
      >
        <h2 id="landing-pillars" className="text-sm font-semibold uppercase tracking-wide text-muted">
          {copy.landing.pillarsHeading}
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink">
          {copy.landing.pillars.map((pillar) => (
            <li key={pillar.text} className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-accent" />
              <span>{pillar.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-page-content flex flex-col gap-3">
        <Link
          href={routes.languages}
          className="rounded-pill text-base text-accent underline underline-offset-4 transition-colors duration-150 ease-out-soft hover:text-accent-deep active:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {copy.landing.languagesLink}
        </Link>
        <Link
          href={routes.designExplorer}
          className="rounded-pill text-base text-accent underline underline-offset-4 transition-colors duration-150 ease-out-soft hover:text-accent-deep active:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {copy.landing.designExplorerLink}
        </Link>
      </p>
    </div>
  );
}
