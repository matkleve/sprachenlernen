# Method detail — the info page behind a card

<!-- id: SPEC-page-method-detail -->
<!-- use-case: UC-042 -->
<!-- status: active -->

One method, fully described. **Methods whose engine is not built** reach this
page from the menu when the card does not open a session directly
([`method-engines.md`](../service/method-engines.md)). **Graded** and **guided**
sessions both use Start → `/practice` when the recipe ships; **card** methods
→ Words review. Direct navigation to `/methods/{id}` still works.

## Scope

- **In:** **full-bleed hero** reusing the same section graphic as method cards
  ([`method-card-header.md`](../component/method-card-header.md), taller variant,
  **fading into `canvas`** — no hard cut); **two-column layout** at `≥ md` — main
  article (large `<h1>`, summary, **badge band** with tier icons + plain effort
  text, **how/why prose** from `trains`, **does-not-do** paragraph) and a
  **practical-details panel** (duration, full needs list, hosted, effort anchor
  sentence, research disclosure). **Topic chip row** when `materialTopics` is set
  ([`method-material-setup.md`](../feature/method-material-setup.md)).
  On `< md` the panel collapses into a
  `Disclosure`. Cards keep Lucide badge row
  ([`method-badge.md`](../component/method-badge.md)). Tier badges:
  [`skill-tier-badge.md`](../component/skill-tier-badge.md). Shell header shows
  **Methods** on drill-in (not the method name; shell uses `<p>` so the in-page
  `<h1>` is unique). Desktop back link preserves filters; mobile shell back chip.
- **Out:** measured effect; wood tier on UI; visible tier/skill text on badges;
  evidence badge in the detail band; effort dot scale; duplicate "Mainly …"
  prose when tiers show the same fact; Start for unbuilt hosted engines; a list
  of labelled micro-sections in the main column.

**UX revision 2026-08-16:** study/33 — tier shields on detail; duration as one
range chip; hero matches card graphic; facts move to sidebar.

**Property audit (UX, 2026-08-16):** study/36 — detail badge band shows **skill tier
icons + plain effort text only** (effort right at `≥ sm`); **no evidence badge**
in the band (disclosure only); **no effort dot scale**; effort anchor sentence in
Practical. Full-bleed hero retained (text-mask deferred). Owner go 2026-08-16.

**Material setup (UX, 2026-08-17):** study/37 — methods with `materialTopics`
show a **topic chip row** (selectable themes + **Your own** for upload) via
[`method-material-setup.md`](../feature/method-material-setup.md).

## Badge band — UX placement (decided 2026-08-16)

Designer reviewed four placements. **Rejected:**

| Placement | Why not |
| --- | --- |
| **Inside the hero** | Shields need ≥ 48px; hero is decorative atmosphere. Competes with the section label and shell chrome. |
| **Before the title** | Metadata before identity — learner opened a named method; the name must lead. |
| **Between title and summary** | Splits the headline from its one-line hook; reads like a spec sheet. |

**Chosen order** (content column, below hero):

1. `<h1>` — full method name
2. **Summary** — one-line hook (`summary`)
3. **Badge band** — skill-tier **shields** (wrap, start) + **plain effort label**
   (end; drops below shields on `< sm`)
4. Prose (`trains`, `doesNotDo`, …)

**What belongs in the band**

| Element | In band? | Notes |
| --- | --- | --- |
| Skill-tier shields ([`skill-tier-badge.md`](../component/skill-tier-badge.md)) | **Yes** | ChatGPT arts assets — icon only, `aria-label` carries tier + skill. Bronze+ only; wood hidden. |
| Plain effort label (e.g. "Draining") | **Yes** | Orthogonal to skill tiers (study/27). Not a dot scale. |
| Evidence ("Thin evidence", etc.) | **No** | Not a shield — orthogonal research grade. Stays in practical-details panel / research disclosure only. |

## Layout order

1. Full-bleed section-graphic hero (same asset as cards; fades to `canvas`)
2. Back link (desktop only, in content column)
3. Two columns at `≥ md`:
   - **Main:** `<h1>` → summary → badge band → **topic chip row** (when
     `materialTopics`) → `trains` prose → `doesNotDo` callout → session footer
     + Start when applicable
   - **Aside:** practical details (duration, needs, hosted, effort anchor, research disclosure)
4. On `< md`: practical details in a collapsed `Disclosure` below the badge band

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods/{id}` | Hero, article, facts panel, or not-found |
| 2 | `srs-session`, taps Start | Navigates to `/words/review?method=srs-session` |
| 2b | Graded or guided method (when built), taps Start | Navigates to `/practice?method={id}` (+ setup query params) |
| 2c | Commitment check-in (when built), taps Start | Navigates to `/practice?method={id}&checkIn=1` |
| 3 | Recipe not built | No Start; **Session not shipped** chip + not-built copy |
| 3b | `hosted: false` with built guided recipe | Start shown — guided session, not prose-only |
| 4 | Back (desktop or shell chip) | `/methods` with filter query preserved |
| 5 | Expands practical details (`< md`) | Duration, needs, hosted, effort anchor, evidence appear |
| 6 | Expands research confidence | Plain evidence label + prose appear |
| 7 | Method has `materialTopics` | Topic chip row below badge band; upload only when **Your own** selected |
| 8 | Method has no `materialTopics` | Start unchanged (e.g. `srs-session`) |

## Acceptance criteria

- [ ] Given a shipped method, when detail renders, then the hero uses the same
      section graphic as its card, spans the viewport width, **fades into the page
      background without a visible hard edge**, and the in-page `<h1>` shows the
      full `name` below the hero.
- [ ] Given any method, when detail renders, then layout order is `<h1>` → summary
      → badge band — not badges before the title or inside the hero.
- [ ] Given bronze+ skill tiers, when the badge band renders, then **shield
      images** appear (not plain text chips) without visible tier labels and a
      **plain effort label** shows on the right at `≥ sm` — not a dot scale.
- [ ] Given wood-only skills, when detail renders, then no skill tier icons appear.
- [ ] Given any method, when the badge band renders, then **evidence does not
      appear** in the band — only in practical details.
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
- [ ] Given intensity 3, when the badge band renders, then effort shows as plain
      text ("Draining") — not a 1–3 dot scale.
- [ ] Given any method, when Practical details render, then the effort anchor
      sentence from `INTENSITY` appears (e.g. "you will be tired afterwards").
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
