import { ExternalLink } from "lucide-react";

import { devPagesSortedByLatest, formatDevPageLastUpdated } from "@/lib/dev-pages";

/**
 * Links to the dev-only preview pages. Contract:
 * docs/specs/page/profile.md § Dev
 *
 * Not translated, and deliberately: everything it points at is English-only
 * owner tooling, so a German label on the way to an English page would be a
 * courtesy that ends one tap later.
 */

export function ProfileDevSection() {
  const devPages = devPagesSortedByLatest();

  return (
    <section className="mt-page-content">
      <h2 className="font-serif text-xl font-semibold text-ink">Dev</h2>
      <p className="mt-1 text-sm text-muted">
        Preview pages for design decisions. Nothing here changes your account or your learning
        data.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {devPages.map((page) => (
          <li key={page.href}>
            <a
              href={page.href}
              className="group flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-soft transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-ink">{page.name}</span>
                <span className="mt-0.5 block text-sm text-muted">{page.description}</span>
                <span className="mt-1 block text-xs text-muted">
                  Last updated {formatDevPageLastUpdated(page.lastUpdatedAt)}
                </span>
              </span>
              <ExternalLink aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
