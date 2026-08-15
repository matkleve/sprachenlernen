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

- **In:** full catalogue fields; **method badge row** and **At a glance** panel
  ([`method-badge.md`](../component/method-badge.md), study/27); in-page **hero
  title** (`name`, full width); tag chips for duration and requirements only
  (nowrap); evidence and intensity as prose in the panel, not multi-line pills;
  `doesNotDo` as a callout surface; on desktop (`≥ md`), a back link preserving
  filter query; on mobile the shell back chip replaces it
  ([`mobile-nav-v2.md`](../feature/mobile-nav-v2.md)); for `srs-session`
  reached directly, a primary control that opens Words review.
- **Out:** measured effect; variants beyond durations; starting non-hosted
  methods; Start control for hosted methods whose engine is not built yet.

**UX revision 2026-08-15:** layout and badge system — study/27. Shell title may
truncate; the in-page hero always shows the full `name`.

## Not-built and off-app copy

One table — implementation in `features/method-menu/content.ts`:

| Case | Start control | Footer / session line |
| --- | --- | --- |
| Hosted, engine built (`srs-session`) | **Start** → `/words/review?method=srs-session` | "The app runs this" |
| Hosted, engine not built | None | `sessionNotBuilt` — session will run here once built; try off-app meanwhile |
| Off-app (`hosted: false`) | None | `notHosted` — learner does this themselves |

The detail page always shows `doesNotDo` and evidence. Hosting status is a tag
chip, not a rank — off-app Methods are not demoted visually. Evidence and
intensity are **badges + prose**, never sentence-length accent chips.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Full entry or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 3 | Other hosted method | No Start control; honest not-built copy |
| 4 | Taps back (desktop) or shell back chip (mobile) | `/methods` with filter query preserved |

## Acceptance criteria

- [ ] Given a shipped method id, when the page renders, then it shows the full
      `name` in the page body, summary, badge row (skills, evidence, effort),
      trains, durations, requirements, hosted status, and `doesNotDo`.
- [ ] Given a long method name, when the page renders on mobile, then the
      in-page hero shows the full name even if the shell title truncates.
- [ ] Given evidence or intensity copy longer than one line, when the page
      renders, then it appears as prose in the At a glance panel — not a
      wrapping pill chip.
- [ ] Given an unknown id, when the page renders, then it does not claim the
      method exists.
- [ ] Given `srs-session`, when Start is tapped, then Words review opens.
- [ ] Given a hosted method other than `srs-session`, when the page renders,
      then no Start control appears and not-built copy is shown.
- [ ] Given a not-hosted method, when the page renders, then no start control
      appears.
- [ ] Given the learner arrived from a filtered `/methods`, when they follow
      back on desktop or the shell back chip on mobile, then the same filter is
      still active.
- [ ] Given viewport &lt; `md`, when the page renders, then no in-page back
      link appears (shell back chip only).
- [ ] The page tree contains no `"use client"` at the page root.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail`
