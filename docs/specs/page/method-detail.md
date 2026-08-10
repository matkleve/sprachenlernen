# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. **Off-app methods** and **hosted methods whose
session is not built** reach this page from the menu. Only `srs-session` opens
its session directly from the card ([SPEC-page-method-menu](method-menu.md)).
Direct navigation to `/methods/{id}` still works for bookmarks and links.

## Scope

- **In:** full catalogue fields; back link preserving filter query; for
  `srs-session` reached directly, a primary control that opens Words review.
- **Out:** measured effect; variants beyond durations; starting non-hosted
  methods; Start control for hosted methods whose session is not built yet.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Full entry or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 3 | Other hosted method | No Start control; honest not-built copy |
| 4 | Taps back | `/methods` with filter query preserved |

## Acceptance criteria

- [ ] Given a shipped method id, when the page renders, then it shows name,
      summary, trains, durations, intensity, requirements, evidence, hosted
      status, and `doesNotDo`.
- [ ] Given an unknown id, when the page renders, then it does not claim the
      method exists.
- [ ] Given `srs-session`, when Start is tapped, then Words review opens.
- [ ] Given a hosted method other than `srs-session`, when the page renders,
      then no Start control appears and not-built copy is shown.
- [ ] Given a not-hosted method, when the page renders, then no start control
      appears.
- [ ] Given the learner arrived from a filtered `/methods`, when they follow
      back, then the same filter is still active.
- [ ] The page tree contains no `"use client"` at the page root.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail`
