# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. **Off-app methods** and **hosted methods whose
session is not built** reach this page from the menu. Only Methods whose engine
is built open a session from the card ([`method-engines.md`](../service/method-engines.md) —
today: `srs-session` → Words review). Direct navigation to `/methods/{id}` still
works for bookmarks and links.

## Scope

- **In:** full catalogue fields; back link preserving filter query; for
  `srs-session` reached directly, a primary control that opens Words review.
- **Out:** measured effect; variants beyond durations; starting non-hosted
  methods; Start control for hosted methods whose engine is not built yet.

## Not-built and off-app copy

One table — implementation in `features/method-menu/content.ts`:

| Case | Start control | Footer / session line |
| --- | --- | --- |
| Hosted, engine built (`srs-session`) | **Start** → `/words/review?method=srs-session` | "The app runs this" |
| Hosted, engine not built | None | `sessionNotBuilt` — session will run here once built; try off-app meanwhile |
| Off-app (`hosted: false`) | None | `notHosted` — learner does this themselves |

The detail page always shows `doesNotDo` and evidence. Hosting status is a chip,
not a rank — off-app Methods are not demoted visually.

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
