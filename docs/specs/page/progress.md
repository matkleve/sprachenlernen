# Progress destination

<!-- id: SPEC-page-progress -->
<!-- use-case: UC-004 -->
<!-- status: active -->

T-B3. The `/progress` destination — where the learner stands, and what the app
is not in a position to say. Replaces the T-B10 holding page.

**Change class: Standard.** It reads learner data but writes none, has no state
machine, and adds no auth surface; the Sensitive row's "anything persisted" is
about write paths, and the read it does goes through the existing adapter under
the existing RLS policy. A reviewer may escalate.

## Scope

- **In:** `lib/level-model.ts` (pure: review history → skill statuses and layer-1
  signal values), `features/progress/`, `app/(app)/progress/page.tsx`.
- **In, from T-B4:** the "what a level costs" section, rendering
  [`../service/dose-band.md`](../service/dose-band.md).
- **In, second half:** the **pool-local vocabulary reading** — how many lemmas in
  the shipped starter pool are held stably, with no extrapolation across the
  language's frequency list (F17, narrowed — see Data); the **pool-local
  form-mastery reading** — how many form-recall Tasks are held stably
  ([`form-mastery-signal.md`](../service/form-mastery-signal.md)).
- **In, V2:** **This week** entry row for the weekly reflection deck
  ([`weekly-reflection.md`](../feature/weekly-reflection.md)) — teaser only on
  the page; full 1–5 card popover on tap.
- **Out:** language-wide vocabulary extrapolation and the CEFR level display it
  would feed (F18–F22) — see Open questions; trend over 30/90/365 days (V1) and every other
  comparison in [`study/03`](../../study/03-level-model.md) V2–V4; the dose
  ledger's **numerator** (hours practised — see
  [`../service/dose-band.md`](../service/dose-band.md)); the vocabulary orbit,
  horizon, and per-word list on `/words`; goals; the cold-start test; any
  language beyond the one in focus.

**Reuse: `Table` with `layout="fit"`** — columns wrap on narrow viewports so
`/progress` stays document-scroll-only (no nested horizontal scroller; see
[`page-layout.md`](../feature/page-layout.md) § Destination scroll).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/progress` | Four skills — reading, listening, speaking, writing — each with its status and, where the status is *not measured*, the route that would produce data for it |
| 2 | Looks for an overall level | The page says there is none and why: the formula needs at least two counting skills ([`study/03`](../../study/03-level-model.md) Layer 3) and today no skill counts |
| 3 | Looks at what *is* recorded | The layer-1 signals that have data, each as a **value with a status, never a level** — recall stability across reviewed tasks, vocabulary size as lemmas held stably in the meaning-recall pool, and form mastery as surface forms held stably in the form-recall pool |
| 4 | Has never reviewed anything | Every skill still reads *not measured*; the signals section says no data has been recorded yet, and links to the review session |
| 5 | Cannot load their history | The error surface (SPEC-service-errors), not an empty page that reads as "no progress" |
| 6 | Has not chosen a language yet | Redirects to the picker. "Not measured" is a statement about a learner who was asked; this one has not been ([`../service/learning-languages.md`](../service/learning-languages.md)) |

## States

No client machine. A Server Component; every value is derived per request from
the review log.

## Data

Reads the learner's rows via `listReviewsForTaskIds` over the starter deck's
task ids — the only content that exists — and rebuilds each Task with
`lib/scheduler.ts`'s `rebuild`. Writes nothing.

**Signal sources today (stage 1):** only **card-engine Reviews** (`srs-session`)
feed this page. No reading, listening, speaking, writing, or off-app Method
produces a layer-1 signal yet — see [`method-engines.md`](../service/method-engines.md).
That is why all four skills read *not measured* even when vocabulary and
stability have data.

**Skill status** is [`study/03`](../../study/03-level-model.md)'s four-value set
and is defined there, not here. This page derives it: a skill is *measured* or
*uncertain* only when a layer-1 signal that feeds it has data. Meaning-recall of
isolated lemmas feeds none of the four — it is not reading, and the study is
explicit that vocabulary is not a skill — so all four are *not measured* until
content exists that produces their signals. That is a derivation, not a
constant: it must fall out of the signal table, so it changes by itself when a
signal starts arriving.

## Acceptance criteria

- [ ] Given a signed-in Account with no reviews, when `/progress` renders, then
      all four skills show *not measured* and no number that looks like a level
      appears.
- [ ] Given an Account with review history, when `/progress` renders, then the
      four skills **still** show *not measured*, because meaning-recall feeds no
      skill signal — a skill is never guessed to fill a gap (UC-004).
- [ ] Given any state, then no overall level is shown, and the page says which
      rule withholds it.
- [ ] Given review history, when the signals section renders, then recall
      stability appears as a value with a status and its derivation named, and
      it is not labelled with a CEFR level (`study/03` § What a signal may claim).
- [ ] Given review history, when the signals section renders, then estimated
      vocabulary size appears as lemmas held stably in the meaning-recall pool,
      names the pool size, and states that no language-wide extrapolation is
      shown.
- [ ] Given form-recall review history, when the signals section renders, then
      form mastery appears as forms held stably in the form-recall pool, names
      the pool size, and states that it is separate from vocabulary size.
- [ ] Given review history where no lemma is held stably, when vocabulary size
      renders, then the held count may be zero and the page still names the
      pool — zero is a measurement, not an empty state.
- [ ] Given any state, then no count that can only rise is presented as
      progress — no streak, no XP, no cards-reviewed total
      ([`study/25`](../../study/25-why-it-does-not-feel-productive.md) C3).
- [ ] Given the review log returns an error, then the error surface renders and
      the page does not read as "nothing learned yet".
- [ ] Given an Account with no language chosen, then the page routes to the
      picker and no reading is derived — an empty reading here would claim
      "nothing measured" about someone who was never asked what to learn.
- [ ] Given the dose section, then the band, the fifteen-minute arithmetic, the
      borrowed-and-uncalibrated statement and the reason there is no
      hours-practised figure all appear.

## Data — vocabulary size (pool-local)

The reading covers the **language in focus** only, never a sum across
languages — UC-025 keeps vocabulary and calibration per language, and a figure
added up across two would be a number about neither.

The full estimator extrapolates SRS holdings over **frequency rank** across the
language ([`study/03`](../../study/03-level-model.md) § Why vocabulary size is
load-bearing). The shipped pool is **2000** lemmas — still short of a calibrated
language-wide boundary estimate, so extrapolation is **withheld**.

What ships instead: count lemmas in the starter pool whose stability exceeds the
graduation threshold (`vocabulary-snapshot`'s `held` rules — `isTaskHeld`). `taskCount` on the
signal is the pool size; `value` is the held count. Copy must say both numbers
and that no language-wide figure is shown.

## Open questions

**⚠ SPEC GAP: language-wide extrapolation and CEFR level display are not built.**
Two things still block them. The anchor table is graded **[C]**, inconsistent
across the literature and explicitly needing per-language calibration — the dose
band's borrowed label is the precedent for how an uncalibrated mapping may be
shown, but no CEFR label may appear on a signal (`study/03` § What a signal may
claim). And extrapolation needs a frequency-ranked pool large enough to estimate
a boundary rank — the shipped pool is five hundred lemmas. Both must be answered before
this page shows a language-wide number or a skill level.

## Check

`npm test -- level-model progress`
