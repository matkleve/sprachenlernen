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

- **In:** **full-bleed hero** reusing the same section graphic as method cards
  ([`method-card-header.md`](../component/method-card-header.md), taller variant);
  **two-column layout** at `≥ md` — main article (large `<h1>`, summary, tier +
  effort badges, **how/why prose** from `trains`, **does-not-do** paragraph) and a
  **practical-details panel** (duration, needs, hosted, research disclosure).
  On `< md` the panel collapses into a `Disclosure`. Cards keep Lucide badge row
  ([`method-badge.md`](../component/method-badge.md)). Tier badges:
  [`skill-tier-badge.md`](../component/skill-tier-badge.md). Shell header keeps
  the methods list title on drill-in (not the method name; shell uses `<p>` so the
  in-page `<h1>` is unique). Desktop back link preserves filters; mobile shell
  back chip.
- **Out:** measured effect; wood tier on UI; visible tier/skill text on badges;
  badge row on cards changing in this slice; Start for unbuilt hosted engines;
  a list of labelled micro-sections in the main column.

**UX revision 2026-08-16:** study/33 — tier badges on detail; duration as one
range chip; hero matches card graphic; facts move to sidebar.

## Layout order

1. Full-bleed section-graphic hero (same asset as cards)
2. Back link (desktop only, in content column)
3. Two columns at `≥ md`:
   - **Main:** `<h1>`, summary, badge band, `trains` prose, `doesNotDo` paragraph,
     session footer + Start when applicable
   - **Aside:** practical details (duration, needs, hosted, research disclosure)
4. On `< md`: practical details in a collapsed `Disclosure` below the badge band

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Hero, article, facts panel, or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 3 | Other hosted method | No Start; not-built copy |
| 4 | Back (desktop or shell chip) | `/methods` with filter query preserved |
| 5 | Expands practical details (`< md`) | Duration, needs, hosted, research appear |
| 6 | Expands research confidence | Plain evidence label + prose |

## Acceptance criteria

- [ ] Given a shipped method, when detail renders, then the hero uses the same
      section graphic as its card, spans the viewport width, and the in-page
      `<h1>` shows the full `name` in the main column below the hero.
- [ ] Given bronze+ skill tiers, when the badge band renders, then tier icons
      appear without visible text labels and effort shows on the right at `≥ sm`.
- [ ] Given wood-only skills, when detail renders, then no skill tier icons appear.
- [ ] Given any method, when detail renders, then `trains` and `doesNotDo` appear
      as prose in the main column — not as a stack of small labelled list rows.
- [ ] Given multiple durations, when the facts panel renders, then one range chip
      is shown (e.g. `10–45 min`), not separate chips per value.
- [ ] Given viewport `< md`, when detail renders, then practical facts are inside
      a collapsed disclosure — not inline list sections in the main column.
- [ ] Given viewport `≥ md`, when detail renders, then practical facts appear in
      a sticky aside beside the article.
- [ ] Given method detail, when the shell header renders, then it shows **Methods**
      (not the method name) and is not a second `<h1>` (`<p>`).
- [ ] Given method detail, when the badge band renders, then evidence and an
      **Effort** label with a 1–3 dot scale are visible outside practical details.
- [ ] Given viewport `< md`, when the hero renders, then the section graphic
      extends under the floating shell header to the top of the viewport.
- [ ] Given evidence C expanded, when disclosure opens, then plain "Thin evidence"
      prose appears — no letter grade prefix.
- [ ] Given unknown id, when the page renders, then it does not claim the method
      exists.
- [ ] Given `srs-session`, when Start is tapped, then Words review opens.
- [ ] Given viewport &lt; `md`, when the page renders, then no in-page back link.
- [ ] The page root has no `"use client"`.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- method-detail skill-tier method-card-header`
