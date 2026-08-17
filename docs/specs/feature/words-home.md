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

**Layout parity with `/methods` (2026-08-16):** canvas intent copy; raised section
cards with `methodSectionSurface` + header graphics; uppercase section labels;
short stat faces with definitions in a collapsed disclosure — not repeated on
every tile. Study/27 card-density rationale applied to vocabulary stats.

**Not the home for all Methods.** Words shows card-engine material only
([`method-engines.md`](../service/method-engines.md)). The catalogue's
reading, listening, speaking, and off-app Methods are reached from `/methods`.

## Scope

- **In:** `features/words/` — `WordsHome`, `WordsReviewCardHeader`,
  `WordsSectionLabel`, `WordsCountDefinitions`, `VocabularyOrbitField`,
  `reading.ts`, `content.ts`; wired on `app/(app)/words/page.tsx`. Review card
  uses `words-home-review.webp`; vocabulary counts card reuses
  `MethodCardHeader` (`vocabulary` section). Derives from
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

**Reuse: `Button`, `Table`, `Disclosure`** — list popover and detail patterns.
**Reuse: `MethodCardHeader`, `methodSectionSurface`** — vocabulary section card
shell and header graphic ([`method-card-header.md`](../component/method-card-header.md)).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Canvas intent copy; review action card with header graphic; vocabulary counts in a raised vocabulary-section card (header graphic, caption, lemma callout, three stat tiles with numbers only, collapsed count definitions); frequency bands as vocabulary-tinted cards; horizon and orbit with uppercase section labels |
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

- [ ] Given a signed-in learner on `/words`, when the page renders, then intent
      copy appears on the canvas above the review card, the review card shows a
      decorative header graphic (`h-20`) with a vocabulary section label on the
      overlay and **Review** as the in-card action heading.
- [ ] Given a signed-in learner on `/words`, when the page renders, then held,
      fragile and new appear as stat tiles (label + number only) inside a
      vocabulary-section card with header graphic; per-bucket definitions live in
      a collapsed disclosure — not on each tile. **meaning
      recall** (not inflected forms), a lemma callout explains what a **lemma** is
      (collapsed in a disclosure below `md`, always visible from `md` up; press
      scales the whole callout shell; expand/collapse animates over 150ms),
      frequency bands name each rank range and stable-held count, the vocabulary
      orbit is present, and Start review links to `srs-session`.
- [ ] Given the starter deck, when the page renders, then the horizon is
      present (collapsed or expanded per [`review-horizon.md`](review-horizon.md))
      and the full atlas is reachable via **Show list**.
- [ ] Given viewport &lt; `md`, when the expanded horizon renders week or day
      columns, then the primary summary and four week columns fit the content
      width without a page-level horizontal scroll trap (day drill-down may
      scroll inside the week row only).
- [ ] Given an Account with no language chosen, then the page routes to the
      picker — an all-zero snapshot would read as a learner who has done
      nothing rather than one who has not been asked.
- [ ] **The negative UC-063 exists for:** given `/words`, then no due count,
      badge or backlog figure appears anywhere.

## Check

`npm test -- words vocabulary-orbit vocabulary-snapshot review-horizon`
