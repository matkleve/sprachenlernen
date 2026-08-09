import Link from "next/link";

import { home } from "@/lib/content";

/**
 * A holding page, deliberately. `/` is the public landing page per ADR-0010,
 * and what it should argue is T-B7 — a product decision nobody has made. So
 * this says one sentence quoted from the study and gets out of the way, rather
 * than acquiring positioning copy by accident on its way past.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">{home.name}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{home.thesis}</h1>

      <p className="mt-page-content">
        <Link
          href="/languages"
          className={
            // A text link, not a Button: this navigates, so it has to be an
            // anchor for middle-click, open-in-new-tab and screen readers.
            // Gap: there is no Link primitive yet. The second surface that needs
            // one is where it earns a spec, not this one.
            "rounded-pill text-base text-accent underline underline-offset-4 " +
            "transition-colors duration-150 ease-out-soft " +
            "hover:text-accent-deep active:text-accent-deep " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
            "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          }
        >
          {home.languagesLink}
        </Link>
      </p>
    </div>
  );
}
