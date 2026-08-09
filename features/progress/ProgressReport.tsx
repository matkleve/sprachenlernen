import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import type { LevelReading } from "@/lib/level-model";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { copy, routeToMeasuring, signalNames, skillNames, statusNames } from "./content";

/**
 * Where the learner stands. Contract: docs/specs/page/progress.md
 *
 * A Server Component with no state: every value is derived per request from the
 * review log. `Reuse: Table` — the same shape of claim as /languages, and the
 * same reason not to reach for a card.
 *
 * The one design rule this surface must not break is study/25 C3: nothing here
 * may be a count that only rises. The card count next to recall stability is
 * that number's derivation — honesty rule 3, "every number opens" — and is
 * deliberately never shown on its own as an achievement.
 */
export function ProgressReport({ reading }: { reading: LevelReading }) {
  const stability = reading.signals.find((signal) => signal.id === "recall-stability");
  const hasAnyData = reading.signals.some((signal) => signal.status === "has-data");

  return (
    <div className="mx-auto max-w-5xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.skillsHeading}</h2>
        <Table caption={copy.skillsCaption} className="mt-4">
          <thead>
            <tr>
              <Th scope="col">{copy.skillColumns.skill}</Th>
              <Th scope="col">{copy.skillColumns.status}</Th>
              <Th scope="col">{copy.skillColumns.route}</Th>
            </tr>
          </thead>
          <tbody>
            {reading.skills.map((skill) => (
              <tr key={skill.skill}>
                <Th scope="row">{skillNames[skill.skill]}</Th>
                <Td className="font-medium text-ink">{statusNames[skill.status]}</Td>
                <Td>{routeToMeasuring[skill.skill]}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.overallHeading}</h2>
        {reading.overall.status === "withheld" ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {copy.overallWithheld}
          </p>
        ) : null}
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.signalsHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.signalsIntro}</p>

        {!hasAnyData ? (
          <div className="mt-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.emptyState}</p>
            <Link
              href={`${routes.wordsReview}?method=srs-session`}
              className={cn(buttonVariants({ variant: "primary" }), "mt-6")}
            >
              {copy.startReview}
            </Link>
          </div>
        ) : null}

        <Table caption={copy.signalsCaption} className="mt-6">
          <thead>
            <tr>
              <Th scope="col">{copy.signalColumns.signal}</Th>
              <Th scope="col">{copy.signalColumns.status}</Th>
              <Th scope="col">{copy.signalColumns.value}</Th>
            </tr>
          </thead>
          <tbody>
            {reading.signals.map((signal) => (
              <tr key={signal.id}>
                <Th scope="row">{signalNames[signal.id]}</Th>
                <Td>{signal.status === "has-data" ? copy.hasData : copy.noData}</Td>
                <Td>
                  {signal.id === "recall-stability" && stability?.value !== null && stability
                    ? copy.stabilityValue(stability.value, stability.taskCount)
                    : copy.noValue}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.gapHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.gapBody}</p>
      </section>
    </div>
  );
}
