import type { MethodEntry } from "@/lib/method-catalogue";

import { copy, evidence, intensity } from "./content";
import { describeDurations, describeRequirements } from "./requirements";

/**
 * One Method, as study/12 specifies the card. Contract:
 * docs/specs/page/method-menu.md
 *
 * "What it does not do" is not an optional field and has no empty state: the
 * catalogue refuses an entry without one, and study/22 names it as the thing
 * that makes this a method card rather than an advertisement with footnotes.
 * If it ever renders conditionally, that is the bug.
 *
 * Three fields study/12 also puts on the card are deliberately absent — the
 * measured effect, "last done", and readiness. All three describe the learner,
 * and this surface reads nothing about one. See the spec's § Open questions.
 */
export function MethodCard({ method }: { method: MethodEntry }) {
  const requirements = describeRequirements(method.requires);

  return (
    <article className="h-full rounded-card border border-line bg-surface p-5 shadow-soft">
      <h3 className="text-base font-semibold text-ink">{method.name}</h3>
      <p className="mt-1 text-sm text-muted">{method.summary}</p>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="inline font-medium text-ink">{copy.card.trains}: </dt>
          <dd className="inline text-muted">{method.trains}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">{copy.card.duration}: </dt>
          <dd className="inline text-muted">{describeDurations(method.durations)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">{copy.card.intensity}: </dt>
          <dd className="inline text-muted">{intensity[method.intensity]}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">{copy.card.needs}: </dt>
          <dd className="inline text-muted">
            {requirements.length === 0
              ? copy.card.needsNothing
              : requirements.join(` — ${copy.eitherOr} — `)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted">
        <span className="font-medium text-ink">{copy.card.doesNotDo}: </span>
        {method.doesNotDo}
      </p>

      <p className="mt-4 text-sm text-muted">{evidence[method.evidence]}</p>
      <p className="mt-1 text-sm text-muted">
        {/* An off-app Method is stated, never demoted — UC-046. Same card, same
            list, same weight; the only difference is this line. */}
        {method.hosted ? copy.hosted : copy.notHosted}
      </p>
    </article>
  );
}
