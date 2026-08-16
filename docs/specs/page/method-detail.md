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

- **In:** **article layout** with a **text-mask hero** (section graphic +
  in-page `<h1>`); summary; **badge band** — skill tier icons (bronze+ only,
  left) and effort label (right); **Practical** (effort sentence, single duration
  chip, requirement chips, hosted); **Trains** prose (no redundant skill line when
  tier badges show); **`doesNotDo`** callout; research-confidence disclosure.
  Cards keep Lucide badge row ([`method-badge.md`](../component/method-badge.md)).
  Tier badges: [`skill-tier-badge.md`](../component/skill-tier-badge.md). Shell
  title truncates; in-page hero owns the document `<h1>` (shell uses `<p>` on
  drill-in). Desktop back link preserves filters; mobile shell back chip.
- **Out:** measured effect; wood tier on UI; visible tier/skill text on badges;
  badge row on cards changing in this slice; Start for unbuilt hosted engines.

**UX revision 2026-08-16:** study/33 — tier badges on detail; duration as one
range chip; hero replaces muted section label.

## Layout order

1. Text-mask hero (`name`)
2. Summary
3. Badge band (skill tier icons + effort)
4. Practical
5. Trains
6. What it does not do (callout)
7. Research confidence (`<details>`)
8. Session footer + Start when applicable

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Hero, summary, badges, sections, or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 3 | Other hosted method | No Start; not-built copy |
| 4 | Back (desktop or shell chip) | `/methods` with filter query preserved |
| 5 | Expands research confidence | Plain evidence label + prose |

## Acceptance criteria

- [ ] Given a shipped method, when detail renders, then the in-page `<h1>` shows
      the full `name` on the hero and summary, Practical, Trains, and `doesNotDo`
      appear below.
- [ ] Given bronze+ skill tiers, when the badge band renders, then tier icons
      appear without visible text labels and effort shows on the right at `≥ sm`.
- [ ] Given wood-only skills, when detail renders, then no skill tier icons appear.
- [ ] Given multiple durations, when Practical renders, then one range chip is
      shown (e.g. `10–45 min`), not separate chips per value.
- [ ] Given tier badges, when Trains renders, then there is no redundant "Mainly:"
      skill line.
- [ ] Given method detail, when the shell header renders, then it is not a second
      `<h1>` (truncated title in `<p>`).
- [ ] Given evidence C expanded, when disclosure opens, then plain "Thin evidence"
      prose appears — no letter grade prefix.
- [ ] Given unknown id, when the page renders, then it does not claim the method
      exists.
- [ ] Given `srs-session`, when Start is tapped, then Words review opens.
- [ ] Given viewport &lt; `md`, when the page renders, then no in-page back link.
- [ ] The page root has no `"use client"`.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail skill-tier`
