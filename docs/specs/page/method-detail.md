# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. **Off-app methods only** reach this page from the
menu — hosted methods open their session directly from the card
([SPEC-page-method-menu](method-menu.md)). Direct navigation to `/methods/{id}`
still works for bookmarks and links.

## Scope

- **In:** full catalogue fields; back link preserving filter query; for hosted
  methods reached directly, a primary control that opens the session (same
  destination as the card would use).
- **Out:** measured effect; variants beyond durations; starting non-hosted
  methods.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Full entry or not-found |
| 2 | Hosted method, taps Start | Navigates to session route — no duration picker |
| 3 | Taps back | `/methods` with filter query preserved |

## Acceptance criteria

- [ ] Given a shipped method id, when the page renders, then it shows name,
      summary, trains, durations, intensity, requirements, evidence, hosted
      status, and `doesNotDo`.
- [ ] Given an unknown id, when the page renders, then it does not claim the
      method exists.
- [ ] Given a hosted method, when Start is tapped, then the session route opens.
- [ ] Given a not-hosted method, when the page renders, then no start control
      appears.
- [ ] Given the learner arrived from a filtered `/methods`, when they follow
      back, then the same filter is still active.
- [ ] The page tree contains no `"use client"` at the page root.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail`
