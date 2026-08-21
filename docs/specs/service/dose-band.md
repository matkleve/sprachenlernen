# Dose band

<!-- id: SPEC-service-dose-band -->
<!-- use-case: UC-004 -->
<!-- status: active -->

T-B4, first half. What a level costs in hours, and what a daily habit buys
against it — F184's denominator, the number
[`study/25`](../../study/STUDY-023-why-it-does-not-feel-productive.md) C4 says nobody
in the category shows. **Standard** — a pure module and one section on an
existing page.

## Scope

- **In:** `lib/dose-band.ts` — the published band, its provenance, and the
  arithmetic from a daily habit to years; the "what a level costs" section of
  [`../page/progress.md`](../page/progress.md).
- **Out:** the **numerator** — hours the learner has actually practised. See
  Open questions. Also out: goals and target levels (V2), progress per hour
  invested (V3), perceived effort (F189), and per-language calibration (F190).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/progress` | For A1, A2, B1 and B2: the cumulative guided hours from a standing start, and what a fifteen-minute daily habit reaches in a year |
| 2 | Reads any figure from it | It is labelled borrowed and uncalibrated — English-derived institutional estimates, an order-of-magnitude guide for a German speaker learning Spanish |
| 3 | Looks for their own hours | The page says the app does not count them, and why |

## States

None. A constant table and two pure functions.

## Data

| Level | Cumulative guided hours |
| --- | --- |
| A1 | 90–100 |
| A2 | 180–200 |
| B1 | 350–400 |
| B2 | 500–600 |

Cumulative **from a standing start**, not per level — read as per-level, B2 is
out by a factor of four. Source: Cambridge/ALTE, via `study/25` C4.

**Roadmap question 19 is answered here, in its first branch.** The question
offers two: label the band as borrowed, or calibrate and date it per language
pair like the level calibration (F190). The second needs data that does not
exist. So `DOSE_BAND_SOURCE.calibratedFor` is `null` and a test pins it there —
when it stops being null, a surface may drop its caveat, and not before.

## Acceptance criteria

- [ ] Given the shipped band, then each level's hours exceed the level below's,
      and each range is non-empty — the table is cumulative, not per level.
- [ ] Given fifteen minutes a day, when `hoursPerYear` runs, then it returns the
      ~91 hours `study/25` C4 states.
- [ ] Given fifteen minutes a day, when `yearsToReach("B1")` runs, then it
      returns roughly 3.8–4.4 years.
- [ ] Given a daily habit of zero or less, then no estimate is returned — never
      an infinite one.
- [ ] Given the source record, then it is marked borrowed and calibrated for
      nothing.
- [ ] Given `/progress`, when the section renders, then every figure is
      accompanied by the statement that the band is borrowed and uncalibrated.

## Open questions

**⚠ SPEC GAP: nothing counts the learner's hours, so the ledger has a
denominator and no numerator.** The app records `latency_ms` per review, which
is time on task inside SRS sessions only. Thesis 9 and the method catalogue put
roughly a third to a half of practice off-app — commitments, reading, speaking —
and none of it is recorded anywhere. A ledger whose numerator counted only SRS
latency would understate real practice by a large and unknowable factor, then
divide it into a 350-hour band, which is worse than showing no numerator at all.
Closing this needs a decision about recording practice time for off-app methods,
which is [`UC-057`](../../use-cases/UC-057-know-whether-a-method-is-right-for-me-yet.md)-adjacent
and not made anywhere.

## Check

`npm test -- dose-band progress`
