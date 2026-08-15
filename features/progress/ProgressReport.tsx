import { ActionLink } from "@/components/ui/ActionLink";
import { TextLink } from "@/components/ui/TextLink";
import { Table, Td, Th } from "@/components/ui/Table";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { DOSE_BANDS, hoursPerYear, yearsToReach } from "@/lib/dose-band";
import type { LevelReading } from "@/lib/level-model";
import { cardEngineSessionHref } from "@/lib/method-session";

import { copy, routeToMeasuring, signalNames, skillNames, statusNames } from "./content";
import { WeeklyReflectionEntry } from "./weekly-reflection/WeeklyReflectionEntry";
import type { WeeklyReflectionModel } from "@/lib/weekly-reflection";

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
/**
 * study/25 C4's own worked example, so the page reproduces the chapter's
 * arithmetic rather than a second one. Not a setting: a habit picker is a goal
 * feature (V2) and nobody has specced one.
 */
const HABIT_MINUTES_PER_DAY = 15;

export function ProgressReport({
  reading,
  reflection,
}: {
  reading: LevelReading;
  reflection: WeeklyReflectionModel;
}) {
  const stability = reading.signals.find((signal) => signal.id === "recall-stability");
  const vocabulary = reading.signals.find((signal) => signal.id === "vocabulary-size");
  const formMastery = reading.signals.find((signal) => signal.id === "form-mastery");
  const hasAnyData = reading.signals.some((signal) => signal.status === "has-data");

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      {reflection.status !== "hidden" ? <WeeklyReflectionEntry reflection={reflection} /> : null}

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.skillsHeading}</h2>
        <Table caption={copy.skillsCaption} layout="fit" className="mt-4">
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

      <section id="signals" className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.signalsHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.signalsIntro}</p>

        {!hasAnyData ? (
          <div className="mt-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.emptyState}</p>
            <ActionLink href={cardEngineSessionHref()} className="mt-6">
              {copy.startReview}
            </ActionLink>
          </div>
        ) : null}

        <Table caption={copy.signalsCaption} layout="fit" className="mt-6">
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
                    : signal.id === "vocabulary-size" &&
                        vocabulary?.status === "has-data" &&
                        vocabulary.value !== null
                      ? copy.vocabularyValue(vocabulary.value, vocabulary.taskCount)
                      : signal.id === "form-mastery" &&
                          formMastery?.status === "has-data" &&
                          formMastery.value !== null
                        ? copy.formMasteryValue(formMastery.value, formMastery.taskCount)
                        : copy.noValue}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.doseHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.doseIntro}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {copy.doseHabit(hoursPerYear(HABIT_MINUTES_PER_DAY))}
        </p>

        <Table caption={copy.doseCaption} layout="fit" className="mt-6">
          <thead>
            <tr>
              <Th scope="col">{copy.doseColumns.level}</Th>
              <Th scope="col">{copy.doseColumns.hours}</Th>
              <Th scope="col">{copy.doseColumns.atFifteen}</Th>
            </tr>
          </thead>
          <tbody>
            {DOSE_BANDS.map((band) => {
              const years = yearsToReach(band.level, HABIT_MINUTES_PER_DAY);

              return (
                <tr key={band.level}>
                  <Th scope="row">{band.level}</Th>
                  <Td>{copy.doseHours(band.minHours, band.maxHours)}</Td>
                  <Td>
                    {years === null ? copy.noValue : copy.doseYears(years.minYears, years.maxYears)}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Not a footnote. The band is uncalibrated for this language pair, and
            question 19's answer is that a surface showing it says so. */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{copy.doseBorrowed}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {copy.doseNoNumerator}
        </p>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{copy.gapHeading}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.gapBody}</p>
      </section>
    </ShellPageContent>
  );
}
