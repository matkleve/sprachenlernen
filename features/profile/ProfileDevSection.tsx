import { ExternalLink } from "lucide-react";

import { devPagesByRecency, formatDevPageUpdatedAt } from "@/lib/dev-pages";

/**
 * Links to the dev-only preview pages. Contract:
 * docs/specs/page/profile.md § Dev
 *
 * Not translated, and deliberately: everything it points at is English-only
 * owner tooling, so a German label on the way to an English page would be a
 * courtesy that ends one tap later.
 */

export function ProfileDevSection() {
  const devPages = devPagesByRecency();

  return (
    <section className="mt-page-content">
      <h2 className="font-serif text-xl font-semibold text-ink">Dev</h2>
      <p className="mt-1 text-sm text-muted">
        Preview pages for design decisions. Nothing here changes your account or your learning
        data. Sorted by last update.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {devPages.map((page) => (
          <li key={page.href}>
            <a
              href={page.href}
              className="group flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-base font-semibold text-ink">{page.name}</span>
                  <time
                    dateTime={page.updatedAt}
                    className="shrink-0 text-xs tabular-nums text-muted"
                  >
                    Updated {formatDevPageUpdatedAt(page.updatedAt)}
                  </time>
                </span>
                <span className="mt-0.5 block text-sm text-muted">{page.description}</span>
              </span>
              <ExternalLink aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
