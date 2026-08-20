import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/ui/ActionLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { DOSE_BANDS, DOSE_BAND_SOURCE, hoursPerYear, yearsToReach } from "@/lib/dose-band";
import type { LevelReading } from "@/lib/level-model";
import { cardEngineSessionHref } from "@/lib/method-session";

import type { FormCellGroupRow } from "@/lib/form-mastery-breakdown";
import type { WeeklyReflectionModel } from "@/lib/weekly-reflection";

import { WeeklyReflectionEntry } from "./weekly-reflection/WeeklyReflectionEntry";
import { Table, Td, Th } from "@/components/ui/Table";

/**
 * Where the learner stands. Contract: docs/specs/page/progress.md
 */
const HABIT_MINUTES_PER_DAY = 15;

export async function ProgressReport({
  reading,
  formCellGroups,
  reflection,
}: {
  reading: LevelReading;
  formCellGroups: readonly FormCellGroupRow[];
  reflection: WeeklyReflectionModel;
}) {
  const t = await getTranslations("progress");
  const stability = reading.signals.find((signal) => signal.id === "recall-stability");
  const vocabulary = reading.signals.find((signal) => signal.id === "vocabulary-size");
  const formMastery = reading.signals.find((signal) => signal.id === "form-mastery");
  const hasAnyData = reading.signals.some((signal) => signal.status === "has-data");
  const showFormGroups =
    formMastery?.status === "has-data" && formCellGroups.length > 0;
  const formsReviewHref = cardEngineSessionHref("form");

  const doseBorrowed =
    DOSE_BAND_SOURCE.calibratedFor === null
      ? t("doseBorrowedUncalibrated", { name: DOSE_BAND_SOURCE.name })
      : t("doseBorrowedCalibrated", {
          name: DOSE_BAND_SOURCE.name,
          calibratedFor: DOSE_BAND_SOURCE.calibratedFor,
        });

  return (
    <ShellPageContent width="wide">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{t("intro")}</p>

      {reflection.status !== "hidden" ? <WeeklyReflectionEntry reflection={reflection} /> : null}

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("skillsHeading")}</h2>
        <Table caption={t("skillsCaption")} layout="fit" className="mt-4">
          <thead>
            <tr>
              <Th scope="col">{t("skillColumns.skill")}</Th>
              <Th scope="col">{t("skillColumns.status")}</Th>
              <Th scope="col">{t("skillColumns.route")}</Th>
            </tr>
          </thead>
          <tbody>
            {reading.skills.map((skill) => (
              <tr key={skill.skill}>
                <Th scope="row">{t(`skillNames.${skill.skill}`)}</Th>
                <Td className="font-medium text-ink">{t(`statusNames.${skill.status}`)}</Td>
                <Td>{t(`routeToMeasuring.${skill.skill}`)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("overallHeading")}</h2>
        {reading.overall.status === "withheld" ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {t("overallWithheld")}
          </p>
        ) : null}
      </section>

      <section id="signals" className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("signalsHeading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("signalsIntro")}</p>

        {!hasAnyData ? (
          <div className="mt-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted">{t("emptyState")}</p>
            <ActionLink href={cardEngineSessionHref()} className="mt-6">
              {t("startReview")}
            </ActionLink>
          </div>
        ) : null}

        <Table caption={t("signalsCaption")} layout="fit" className="mt-6">
          <thead>
            <tr>
              <Th scope="col">{t("signalColumns.signal")}</Th>
              <Th scope="col">{t("signalColumns.status")}</Th>
              <Th scope="col">{t("signalColumns.value")}</Th>
            </tr>
          </thead>
          <tbody>
            {reading.signals.map((signal) => (
              <tr key={signal.id}>
                <Th scope="row">{t(`signalNames.${signal.id}`)}</Th>
                <Td>{signal.status === "has-data" ? t("hasData") : t("noData")}</Td>
                <Td>
                  {signal.id === "recall-stability" && stability?.value !== null && stability
                    ? t("stabilityValue", {
                        days: stability.value,
                        taskCount: stability.taskCount,
                      })
                    : signal.id === "vocabulary-size" &&
                        vocabulary?.status === "has-data" &&
                        vocabulary.value !== null
                      ? t("vocabularyValue", {
                          held: vocabulary.value,
                          poolSize: vocabulary.taskCount,
                        })
                      : signal.id === "form-mastery" &&
                          formMastery?.status === "has-data" &&
                          formMastery.value !== null
                        ? t("formMasteryValue", {
                            held: formMastery.value,
                            poolSize: formMastery.taskCount,
                          })
                        : t("noValue")}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {formMastery?.partialParadigmLemmaCount ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {t("formMasteryPartialParadigmNote", {
              count: formMastery.partialParadigmLemmaCount,
            })}
          </p>
        ) : null}
        {showFormGroups ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-ink">{t("formGroupsHeading")}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {t("formGroupsCaption")}
            </p>
            <Table caption={t("formGroupsHeading")} layout="fit" className="mt-4">
              <thead>
                <tr>
                  <Th scope="col">{t("formGroupsColumns.pattern")}</Th>
                  <Th scope="col">{t("formGroupsColumns.held")}</Th>
                  <Th scope="col">{t("formGroupsColumns.practice")}</Th>
                </tr>
              </thead>
              <tbody>
                {formCellGroups.map((group) => (
                  <tr key={group.groupKey}>
                    <Th scope="row" className="capitalize">
                      {group.label}
                    </Th>
                    <Td>
                      {t("formGroupHeld", { held: group.held, poolSize: group.poolSize })}
                    </Td>
                    <Td>
                      {group.weak ? (
                        <ActionLink href={formsReviewHref} variant="secondary" size="sm">
                          {t("formGroupPracticeLink")}
                        </ActionLink>
                      ) : (
                        t("formGroupPracticeDone")
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("doseHeading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("doseIntro")}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {t("doseHabit", { hours: Math.round(hoursPerYear(HABIT_MINUTES_PER_DAY)) })}
        </p>

        <Table caption={t("doseCaption")} layout="fit" className="mt-6">
          <thead>
            <tr>
              <Th scope="col">{t("doseColumns.level")}</Th>
              <Th scope="col">{t("doseColumns.hours")}</Th>
              <Th scope="col">{t("doseColumns.atFifteen")}</Th>
            </tr>
          </thead>
          <tbody>
            {DOSE_BANDS.map((band) => {
              const years = yearsToReach(band.level, HABIT_MINUTES_PER_DAY);

              return (
                <tr key={band.level}>
                  <Th scope="row">{band.level}</Th>
                  <Td>{t("doseHours", { min: band.minHours, max: band.maxHours })}</Td>
                  <Td>
                    {years === null
                      ? t("noValue")
                      : t("doseYears", { minYears: years.minYears, maxYears: years.maxYears })}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{doseBorrowed}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {t("doseNoNumerator")}
        </p>
      </section>

      <section className="mt-page-content">
        <h2 className="text-xl font-semibold text-ink">{t("gapHeading")}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("gapBody")}</p>
      </section>
    </ShellPageContent>
  );
}
