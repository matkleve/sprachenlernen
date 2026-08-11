# Words home

<!-- id: SPEC-feature-words-home -->
<!-- use-case: UC-063 -->
<!-- status: active -->

The `/words` vocabulary home — held/shaky/new counts, a 30-day review horizon,
and the vocabulary atlas. Reviewing is one action here, not the page's identity
(ADR-0009, UC-063).

## Scope

- **In:** `features/words/` — `WordsHome`, `reading.ts`, `content.ts`; wired on
  `app/(app)/words/page.tsx`. Derives from
  [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md).
- **Out:** due counts anywhere (A3); skills and level display (Progress);
  session-length picker; choosing a method other than `srs-session` from this page.

**Reuse: `Button`, `Table`** — same primitives as Progress.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Intent copy, Start review, held/shaky/new counts, horizon, atlas |
| 1a | Deck is larger than the atlas cap | Atlas lists the **100** most frequent words and says how many of how many it is showing |
| 2 | Taps Start review | Navigates to `/words/review?method=srs-session` |
| 3 | History load fails | Error callout; no fake empty snapshot |

## States

No client machine. Server page with `ok | error` outcomes.

## Acceptance criteria

- [ ] Given a signed-in learner on `/words`, when the page renders, then held,
      shaky and new counts are shown and Start review links to `srs-session`.
- [ ] Given the starter deck, when the page renders, then a 30-day horizon and
      atlas table are present.
- [ ] Given a deck larger than 100 lemmas, when the page renders, then the atlas
      shows the 100 most frequent rows and names both numbers — the tail is 400
      rows of "New" that push the rest of the page out of reach, and a silent
      truncation would read as a smaller deck than the counts above it claim.
- [ ] **The negative UC-063 exists for:** given `/words`, then no due count,
      badge or backlog figure appears anywhere.

## Check

`npm test -- words vocabulary-snapshot`
