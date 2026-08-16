# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. **Off-app methods** and **hosted methods whose
session is not built** reach this page from the menu. Only Methods whose engine
is built open a session from the card ([`method-engines.md`](../service/method-engines.md) —
today: `srs-session` → Words review). Direct navigation to `/methods/{id}` still
works for bookmarks and links.

**Draft exploration (2026-08-16):** text-mask hero, skill-tier badge band,
duration chip UX — [`method-detail.supplement.md`](method-detail.supplement.md),
[`study/33`](../../study/33-skill-tier-badges-exploration.md). Not normative until
merged here.

## Scope

- **In:** full catalogue fields as an **article layout** — not a second card.
  In-page **hero title** (`name`, full width) and summary; **Practical** section
  (effort sentence, duration and requirement chips, hosted status); **Trains**
  prose with optional skill contribution line; **`doesNotDo`** as the single
  emphasized callout; **research confidence** in a collapsed disclosure at the
  bottom (plain label + prose — no letter grade in primary UI). Badges stay on
  [`MethodCard`](method-menu.md) only ([`method-badge.md`](../component/method-badge.md)).
  On desktop (`≥ md`), a back link preserving filter query; on mobile the shell
  back chip replaces it ([`mobile-nav-v2.md`](../feature/mobile-nav-v2.md)); for
  `srs-session` reached directly, a primary control that opens Words review.
- **Out:** measured effect; variants beyond durations; starting non-hosted
  methods; Start control for hosted methods whose engine is not built yet;
  badge row or raised "At a glance" panel on detail.

**UX revision 2026-08-15 (badges):** study/27 — shell title may truncate; hero
shows full `name`.

**UX revision 2026-08-15 (article layout):** detail reads as a briefing, not a
larger card. Catalogue owns comparison badges; detail owns mechanism, limits,
and logistics.

## Not-built and off-app copy

One table — implementation in `features/method-menu/content.ts`:

| Case | Start control | Footer / session line |
| --- | --- | --- |
| Hosted, engine built (`srs-session`) | **Start** → `/words/review?method=srs-session` | "The app runs this" |
| Hosted, engine not built | None | `sessionNotBuilt` — session will run here once built; try off-app meanwhile |
| Off-app (`hosted: false`) | None | `notHosted` — learner does this themselves |

The detail page always shows `doesNotDo`. Research confidence is available in a
disclosure — not promoted to a spec-sheet row. Hosting status is a tag chip in
Practical, not a rank — off-app Methods are not demoted visually.

## Layout order

1. Section label (muted)
2. Hero title + summary
3. **Practical** — effort sentence; Takes / Needs / hosted chips
4. **Trains** — mechanism prose; skill contribution line when marks exist
5. **What it does not do** — single callout surface
6. **How sure is the research?** — `<details>` disclosure (collapsed by default)
7. Session footer copy + Start when applicable

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Full entry or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 3 | Other hosted method | No Start control; honest not-built copy |
| 4 | Taps back (desktop) or shell back chip (mobile) | `/methods` with filter query preserved |
| 5 | Expands research confidence | Plain evidence label + prose — no "Evidence A" prefix |

## Acceptance criteria

- [ ] Given a shipped method id, when the page renders, then it shows the full
      `name` in the page body, summary, Practical block, trains, `doesNotDo`,
      and research-confidence disclosure.
- [ ] Given a long method name, when the page renders on mobile, then the
      in-page hero shows the full name even if the shell title truncates.
- [ ] Given method detail, when it renders, then there is no badge row and no
      raised "At a glance" panel.
- [ ] Given evidence C on detail, when the disclosure is expanded, then the
      content shows "Thin evidence" and plain prose — not "Evidence C" or a bare
      letter grade in the primary UI.
- [ ] Given intensity 1 on detail, when Practical renders, then the effort line
      shows "Light effort" and the intensity anchor sentence — not a dot scale.
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
