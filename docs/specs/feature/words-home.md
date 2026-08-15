# Words home

<!-- id: SPEC-feature-words-home -->
<!-- use-case: UC-063 -->
<!-- use-case: UC-031 -->
<!-- use-case: UC-005 -->
<!-- use-case: UC-006 -->
<!-- status: active -->

The `/words` vocabulary home — held/fragile/new counts, the review horizon
([`review-horizon.md`](review-horizon.md)), and the vocabulary orbit. Reviewing
is one action here, not the page's identity (ADR-0009, UC-063).

**Not the home for all Methods.** Words shows card-engine material only
([`method-engines.md`](../service/method-engines.md)). The catalogue's
reading, listening, speaking, and off-app Methods are reached from `/methods`.

## Scope

- **In:** `features/words/` — `WordsHome`, `VocabularyOrbitField`, `reading.ts`,
  `content.ts`; wired on `app/(app)/words/page.tsx`. Derives from
  [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md),
  [`frequency-blocks.md`](../service/frequency-blocks.md),
  [`vocabulary-orbit.md`](vocabulary-orbit.md), and **only** Reviews from built
  card-engine Methods (today: `srs-session`); `reading.ts` filters
  `poolForActiveLanguage()`'s cards down to **meaning-recall only** before
  building the snapshot — one atlas row per word, never one per Task.
- **Out:** due counts anywhere (A3); skills and level display (Progress);
  session-length picker; choosing a method other than a built card-engine Method
  from this page; holdings or horizon for Methods without a card engine;
  form-recall progress (that's [`form-mastery-signal.md`](../service/form-mastery-signal.md),
  on Progress). Horizon presentation detail lives in
  [`review-horizon.md`](review-horizon.md).

**Reuse: `Button`, `Table`** — list popover and detail patterns.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Intent copy and Start review in a raised action card; held/fragile/new counts, frequency bands, horizon (per review-horizon collapsed/expanded rules), vocabulary orbit below |
| 2 | Taps Start review | Navigates to `/words/review?method=srs-session` |
| 3 | Taps a segment or **Show list** | See [`vocabulary-orbit.md`](vocabulary-orbit.md) |
| 4 | Expands or collapses horizon | See [`review-horizon.md`](review-horizon.md) |
| 5 | History load fails | Error callout; no fake empty snapshot |
| 6 | No language chosen yet | Redirects to the picker rather than rendering an all-zero snapshot |

## States

No page-level client machine. Orbit selection, list popover, and horizon
expand/collapse are client-local. Server page with `ok | error | no-language`
outcomes.

## Acceptance criteria

- [ ] Given a signed-in learner on `/words`, when the page renders, then held,
      fragile and new counts are shown, frequency bands name each rank range and
      stable-held count, the vocabulary orbit is present, and Start review links
      to `srs-session`.
- [ ] Given the starter deck, when the page renders, then the horizon is
      present (collapsed or expanded per [`review-horizon.md`](review-horizon.md))
      and the full atlas is reachable via **Show list**.
- [ ] Given viewport &lt; `md`, when the expanded horizon renders week or day
      columns, then week and day rows use equal `flex-1` share inside the
      content width without nested `overflow-x-auto` (document scroll only).
- [ ] Given an Account with no language chosen, then the page routes to the
      picker — an all-zero snapshot would read as a learner who has done
      nothing rather than one who has not been asked.
- [ ] **The negative UC-063 exists for:** given `/words`, then no due count,
      badge or backlog figure appears anywhere.

## Check

`npm test -- words vocabulary-orbit vocabulary-snapshot review-horizon`
