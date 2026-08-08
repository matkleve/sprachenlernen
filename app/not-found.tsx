import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        That address does not exist. It may have moved, or the link may be old.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="rounded-pill text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Back to the start
        </Link>
      </p>
    </div>
  );
}
