# Words destination

<!-- id: SPEC-page-words -->
<!-- use-case: UC-063 -->
<!-- status: active -->

The `/words` destination — vocabulary home and one-tap entry to reviewing
(UC-063). Replaces the T-B1 holding page.

## Scope

- **In:** `app/(app)/words/page.tsx` — ADR-0009 intent copy, a **Start review**
  control linking to `/words/review?method=srs-session`, no due count.
- **Out:** vocabulary atlas, horizon, held/shaky lists (T-B3); session-length
  picker; choosing a method other than srs-session from this page.

**Reuse: `Button`** as the start control (link-styled or `asChild` pattern).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Title, intent copy, Start review control |
| 2 | Taps Start review | Navigates to `/words/review?method=srs-session` without passing through Methods |

## States

No client machine.

## Acceptance criteria

- [ ] Given a signed-in Account on `/words`, when the page renders, then a Start
      review control is present linking to `srs-session` review.
- [ ] **The negative UC-063 exists for:** given `/words`, then no due count,
      badge or backlog figure appears anywhere.

## Check

`npm test -- words`
