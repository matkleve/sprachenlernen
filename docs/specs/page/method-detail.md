# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. Reachable from its card on `/methods` before the
learner decides to do it. Serves UC-042's "every method has a page reachable
from its card" with catalogue data only — mechanism prose and variants ship when
the catalogue carries them.

## Scope

- **In:** name, summary, what it trains, duration variants, intensity, context
  requirements, evidence grade, hosted status, and the mandatory "what it does
  not do" section; a back link to `/methods` preserving any active filter query
  string; a primary action labelled honestly when the app cannot start the
  method yet.
- **Out:** starting a session (T-B1); measured effect and "last done"; variants
  list beyond what durations already state; citations; comparing methods by
  score; learner-specific numbers.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a method card on `/methods` | Navigates to `/methods/{id}` |
| 2 | Opens `/methods/{id}` for a shipped method | The full catalogue entry, grouped like the card but with room for prose |
| 3 | Opens `/methods/{id}` for an unknown id | A short not-found message and a link back |
| 4 | Taps back | Returns to `/methods`, with the same `?context=` / custom params they arrived with |
| 5 | Sees a method the app hosts | A primary button that says the session is not built yet — not a dead control with no explanation |
| 6 | Sees a method the app does not host | No start button; the off-app line from the card |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `found` | id matches a method entry | Full detail | no |
| `not-found` | id matches nothing | Message + back link | no |

## Data

Reads `data/methods/*.json` through `loadCatalogue` and `byId`. Writes nothing.
The back link receives the caller's search string from the card link.

## Acceptance criteria

- [ ] Given a shipped method id, when the page renders, then it shows the
      method's name, summary, trains, durations, intensity, requirements,
      evidence grade, hosted status, and `doesNotDo`.
- [ ] Given an unknown id, when the page renders, then it does not claim the
      method exists.
- [ ] Given a hosted method, when the page renders, then a primary control
      states that starting is not available yet.
- [ ] Given a not-hosted method, when the page renders, then no start control
      appears.
- [ ] Given the learner arrived from a filtered `/methods`, when they follow
      back, then the same filter is still active.
- [ ] The page component tree contains no `"use client"` directive.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail`
