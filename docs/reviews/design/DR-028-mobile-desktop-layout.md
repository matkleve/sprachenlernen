# 28 · Mobile and desktop layout: what differs, what should

<!-- id: DR-028 -->
<!-- type: design-review -->
<!-- status: active -->

How the signed-in shell behaves on a phone versus a laptop, what the industry
usually does, and whether this product should diverge. **Normative contract:**
[`../specs/feature/page-layout.md`](../../specs/feature/page-layout.md). This
chapter is the reasoning layer for changes to that spec.

---

## What we ship today

Breakpoint: Tailwind `md` (768px). Below = **floating** mobile chrome; at and above =
**flat** top-nav chrome (desktop and iPad). There is no third shell variant yet.

### Navigation and chrome

| Dimension | Mobile (`< md`) | Desktop (`≥ md`) |
| --- | --- | --- |
| **Primary nav** | Fixed bottom pill — three **icon-only** round chips | Sticky top header — three **icon + text** links |
| **Account** | Top-right icon chip → `/profile` | Top-right text link "Account" with icon |
| **Language** | Top-left floating emoji chip → popover (destination roots only) | Inline flag switcher in header row |
| **Back** | Top-left icon chip on drill-in routes; language chip hidden | In-page text link on method detail only (`md:inline`); shell has no back chip |
| **Page title** | Centred between corner chips; scales down on scroll; may wrap to two lines | Centred in header; single line with ellipsis |
| **Header scrim** | Fixed overlay; blur + tint intensifies on scroll | Sticky; same scrim behaviour |
| **Footer** | Fixed pill + scrim + tap shield above Safari toolbar | None |
| **`<main>` padding** | Top/bottom reserves for floats (`--shell-float-*`) | No float reserves |

### Content and scroll

| Dimension | Mobile | Desktop |
| --- | --- | --- |
| **Default pages** | Document scroll inside `<main>`; shell float top reserve + `pb-page-bottom` (no mobile `pt-page-top`) | `md:pt-page-top` / `pb-page-bottom` rhythm; more horizontal room (`max-w-5xl` on wide surfaces) |
| **Review session** | **One-screen runner** — `h-review-session`, no page scroll; title pinned small | **Scrollable** — runner height constraint dropped; normal page padding |
| **Horizontal padding** | `px-6` (runner uses `px-4` on small screens) | `px-6` |
| **Safari toolbar** | `visualViewport` JS lifts bottom pill when browser chrome appears | N/A |

### What is intentionally the same

- **Three destinations** — Methods, Words, Progress — same order and labels
  (mobile: `aria-label` only).
- **No due-count badges** anywhere (UC-063, [10](../../study/STUDY-009-antipatterns.md) A3).
- **ShellPageContent** width tokens (`narrow` / `default` / `wide`) — not
  breakpoint-specific today.
- **Colour and typography** — one design system; no separate mobile theme.

---

## Why the split exists

### Thumb reach and posture **[B]**

Mobile interaction research consistently places primary navigation in the bottom
third of the screen — the thumb zone on one-handed use. Top bars for global
navigation on phones are reach-poor and compete with browser chrome. Bottom tab
bars are the default for daily-use consumer mobile products (native and PWA).

Desktop users have precision pointers, wider fields of view, and no browser
bottom toolbar. A persistent **top** row scales to three labelled destinations
without crowding; a bottom strip on a 27″ monitor is visually wrong and far from
the cursor's home position.

### Information density **[C]**

Desktop can show **language + destinations + account + title** in one band
without hiding labels. On a 390px-wide phone, text labels on three destinations
plus two corner chips plus a two-line title produced overlap and tap errors —
hence icon-only pill segments matching the 44px corner chips.

### Viewport mechanics **[A]** (engineering, not preference)

Mobile Safari's in-browser toolbar is not the same problem as desktop Chrome's
address bar:

- `env(safe-area-inset-*)` handles notch/home indicator, not Safari's bottom
  toolbar.
- Fixed bottom UI needs `visualViewport` measurement or the pill sits under
  browser chrome ([`../TRAPS.md`/../../TRAPS.md)).
- A flex-column shell with the nav as a non-fixed child is more stable on iOS
  standalone PWAs but conflicts with **floating** pills and scrims over scrolling
  content — the choice documented in the page-layout spec.

### Exercise shape **[D]**

[23](../../study/STUDY-021-how-an-exercise-runs.md): a card session is one long **Do** step. On a
phone, card + grade row must fit without the learner scrolling the **page** —
scrolling the page during grading is a broken exercise. Desktop has vertical
slack; pinning the runner to one screen is less critical, so the runner may
scroll.

---

## What mature products usually do

| Pattern | Desktop | Mobile | Fit for this app |
| --- | --- | --- | --- |
| **Top bar only** | 3–6 peer sections | Rarely alone on daily-use apps | Desktop: **yes** (shallow IA) |
| **Bottom tab bar** | Unusual | Default for 3–5 destinations | Mobile: **yes** |
| **Persistent sidebar** | Dashboards, deep IA | Collapses to drawer or tabs | **No** — only three destinations |
| **Navigation rail** (icon sidebar) | Material-style tools | Sometimes on tablet | **Maybe** at `lg` — see below |
| **Immersive runner** | Full-screen or chromeless session | Common in flashcard apps | **Partial** — we keep bottom pill |

**Anki** (landscape reference): mobile = bottom-ish controls and minimal chrome
during review; desktop = menu bar + flexible window. Same IA, different chrome
density — not a different product.

**Duolingo**: bottom tabs on mobile; desktop web often still uses bottom or
centred layout — optimised for mobile-first return ([01](../../study/STUDY-001-duolingo.md)), not
a model for this product's honesty positioning.

---

## Could we do something different?

Options ranked by how much they change the learner's mental model.

### 1 · Keep the current split (recommended baseline) **[D]**

**What:** Bottom floating pill on `< md`; sticky labelled header on `≥ md`; runner
one-screen on mobile only.

**Pros:** Matches industry defaults; already specced and built; three destinations
do not justify a sidebar; UC-063 preserved.

**Cons:** Two chrome implementations to maintain; Safari toolbar edge cases;
floating aesthetic is a deliberate **[D]** choice ([22](../../study/STUDY-020-visual-design.md)
"well-made tool") — some learners may find it less familiar than a flat tab bar.

**Cost:** Ongoing — already paid.

---

### 2 · Tablet / `lg` navigation rail **[D]**

**What:** Between `md` and `lg`, or from `lg` up on touch devices, use a slim
left **icon rail** (Methods / Words / Progress) instead of only the top header.

**Pros:** More vertical space for content on iPad; thumb-friendly on tablet
portrait without bottom pill + Safari toolbar fights.

**Cons:** Third chrome variant; rail without labels repeats the mobile icon-only
discoverability problem unless tooltips are excellent; **conflicts with owner
direction (2026-08-15): flat top nav from `md` up, floating only below.**

**Verdict:** **Reject** for v1. iPad is first-class at the **flat top-nav**
tier (`≥ md`), not via a separate rail. Revisit only if iPad usability testing
shows top-nav reach failures in portrait.

---

### 3 · Immersive review — hide destination nav during session **[D]**

**What:** On `/words/review?method=srs-session`, hide the bottom pill (and maybe
top chips) until the session ends — full focus on card + grades.

**Pros:** Matches Anki-style focus; more vertical space for card on small phones;
fewer mis-taps leaving mid-session.

**Cons:** **Conflicts with current spec** — mobile-nav-v2 keeps the pill visible
on review; UC-063 wants one-tap escape to other destinations without negotiating
a menu — hiding nav makes Words/Progress a two-step exit (back → destination).
Contradicts "flashcards is one method among many" ([IMPLEMENTATION-PLAN](../../IMPLEMENTATION-PLAN.md)
settlement): the learner should remain oriented in the three-destination frame.

**Verdict:** **Reject** as default behaviour. **Owner 2026-08-15: keep pill
visible during review** — one-tap destination access (UC-063). Optional later:
learner setting "focus mode" that hides chrome.

---

### 4 · Desktop sidebar instead of top header **[D]**

**What:** Left sidebar with Methods / Words / Progress + language at top.

**Pros:** Scales if a fourth destination ever ships; familiar from Notion/Linear.

**Cons:** **Overbuilt for three links.** Steals horizontal space from text-heavy
surfaces ([22](../../study/STUDY-020-visual-design.md)). Progress and Words need wide charts/maps
([19](../../study/STUDY-017-milestones-and-map.md)). Top header already fits language + nav + account.

**Verdict:** **Reject** until IA depth exceeds ~5 peer destinations.

---

### 5 · Unified flex shell (nav not fixed) on mobile **[C]**

**What:** `h-dvh overflow-hidden` root; bottom nav as flex child; only `<main>`
scrolls — no floating pill, no `visualViewport` JS.

**Pros:** Eliminates Safari fixed-position bugs; common PWA recommendation.

**Cons:** Loses floating scrims and title-over-content aesthetic; bottom bar
reads as **attached** not **floating** — a visual redesign, not a layout tweak
([`../specs/feature/page-layout.md`](../../specs/feature/page-layout.md) rejected
this).

**Verdict:** **Reject** unless visual design explicitly moves to flat chrome.
**Owner 2026-08-15: floating pill on `< md` is permanent**; desktop/tablet flat
top nav is the other pole of the system.

---

### 6 · Desktop runner also one-screen **[D]**

**What:** Apply `h-review-session` (or full viewport) on desktop during review.

**Pros:** Consistent exercise frame across devices.

**Cons:** Wastes desktop space on error/summary states; keyboard users may expect
to scroll long completion copy; low benefit when card + grades already fit.

**Verdict:** **Keep asymmetric** — mobile one-screen, desktop scrollable.

---

### 7 · Breakpoint-specific content width **[D]**

**What:** e.g. Methods catalogue `max-w-5xl` on desktop but `max-w-full` on
mobile; Progress table horizontal scroll only on mobile.

**Pros:** Uses phone width for filters and cards; avoids tiny centred column.

**Cons:** More per-page design; must not break token discipline.

**Verdict:** **Per-surface UX passes**, not a shell change. Method menu filter
chips already use responsive grids; Words orbit may need more phone-specific
layout — track in feature specs, not shell.

---

### 8 · Desktop keyboard shortcuts for destinations **[D]**

**What:** `1` / `2` / `3` or `M` / `W` / `P` for Methods / Words / Progress.

**Pros:** Power-user speed; zero mobile cost.

**Cons:** Discoverability; conflicts with in-session shortcuts when review grows.

**Verdict:** **Good follow-up** for desktop only — does not change layout.

---

## Recommendations

| Priority | Action | Class |
| --- | --- | --- |
| **Now** | Floating pill `< md`; flat labelled top nav `≥ md` | Done |
| **Now** | Runner one-screen on `< md` only; pill stays visible in review | Done |
| **Now** | iPad first-class: same flat top nav as desktop; iPad Safari in LIVE CHECK | Standard |
| **Later** | Desktop shortcut keys for destinations | Trivial / Standard |
| **Do not** | Sidebar; navigation rail; immersive nav hide on review; flat mobile bar | Owner + spec |

### Decided 2026-08-15 (owner)

1. **Chrome families** — **Floating** bottom pill + corner chips on **phone**
   (`< md`). **Flat** sticky top nav on **desktop and iPad** (`≥ md`). Not
   floating on large screens.
2. **Review** — **Keep** the destination pill visible during an active session.
   One-tap escape to Methods / Words / Progress outweighs immersive focus.
3. **iPad** — **First-class target** for v1. Uses the flat top-nav shell, not a
   deferred third layout. QA must include iPad Safari (portrait and landscape).

4. **Profile** — Stays a corner / header link, not a fourth pill (ADR-0009).
   Mobile icon-only vs desktop labelled link remains acceptable.

---

## What this implies for specs

- Shell differences are **intentional**, not drift — encode in
  [`page-layout.md`](../../specs/feature/page-layout.md) and
  [`mobile-nav-v2.md`](../../specs/feature/mobile-nav-v2.md), not per-page hacks.
- New surfaces should use `ShellPageContent` + layout mode registry; breakpoint
  behaviour changes go through this chapter first.
- Visual redesign of chrome ([22](../../study/STUDY-020-visual-design.md)) is a separate decision
  from IA; do not change navigation placement without updating UC-063 impact.

---

## Sources (honesty)

| Grade | Claim |
| --- | --- |
| **[B]** | Bottom navigation in thumb zone; labelled vs icon-only trade-offs on small screens |
| **[C]** | Industry pattern tables (SaaS UI, UX Patterns Guide, 2025–2026 summaries) — synthesised, not primary studies |
| **[D]** | All product-specific recommendations in this chapter |
| **Engineering** | Safari `visualViewport`, safe-area — documented in MDN and [`../TRAPS.md`/../../TRAPS.md) |

Add primary citations to [`STUDY-sources.md`](../../study/STUDY-sources.md) if this chapter becomes
load-bearing for an ADR.
