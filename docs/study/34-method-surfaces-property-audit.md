# 34 · Method surfaces — property audit (UX designer review)

**Status:** recommendation — pending owner **go** before implementation.
Written 2026-08-16 after owner flagged drift: cards look leaner (badges + chips),
detail grew a badge band again, and the **effort dot scale** reappeared on detail
while study/27 shipped plain labels on cards.

This chapter audits **every catalogue field and every UI property** on method
cards and detail pages, decides what belongs where, and resolves tensions between
[27](27-method-badges.md), [33](33-skill-tier-badges-exploration.md), and what
shipped on 2026-08-16.

Implementation contracts updated in the same session:
[`method-menu.md`](../specs/page/method-menu.md),
[`method-detail.md`](../specs/page/method-detail.md),
[`method-badge.md`](../specs/component/method-badge.md) — **draft until go**.

---

## The three scan questions (unchanged)

Browsing ~53 methods, the learner must answer in under two seconds per card:

1. **What is this mainly for?** → skill contribution
2. **How sure is anyone that it works?** → evidence
3. **Can I manage it right now?** → effort / intensity

Everything else is **logistics** (duration, needs, hosted) or **depth** (mechanism,
limits, research prose) — not a fourth badge family.

---

## Catalogue fields — show, hide, or later

| Field | Meaning | Card | Detail | Verdict |
| --- | --- | --- | --- | --- |
| `name` | Title | ✓ | ✓ (`<h1>`) | **Show** — hero on detail even when shell truncates |
| `summary` | One-line what you do | ✓ | ✓ | **Show** |
| `section` | Catalogue grouping | graphic + label | graphic hero | **Show** — rhythm, not rank |
| `skills[]` | Target skills | via skill marks | via tier badges | **Show** — derived v1 |
| `trains` | Mechanism prose | — | ✓ main column | **Show on detail only** — too long for cards |
| `evidence` | Research grade A–D | plain label badge | disclosure prose | **Show** — never letter grade in UI |
| `intensity` 1–3 | Cognitive load | plain label badge | label + anchor sentence | **Show** — **never dot scale** |
| `durations` | Session lengths (pick one) | one range chip | one chip + optional list in Practical | **Show** — one chip, not three |
| `requires` | Context dimensions | ≤2 blocking chips | full needs list | **Reduce on card** — see § Logistics |
| `hosted` | App runs session | chip | chip + sentence | **Show** — routing honesty |
| `doesNotDo` | Mandatory limits | clamped 2 lines | callout | **Show** — constitution rule |
| `demanding` | Catalogue flag | — | — | **Do not surface** — overlaps effort + `doesNotDo` |
| `targetSignal` | Layer-1 signal | — | — | **Later** — learner-facing when progress ties in |
| `offerEveryDays` | Offer floor | — | — | **Later** — floor prompts, not card fields |
| `type` commitment | Standing commitment | — | — | **Out of method card pattern** — different surface |
| Per-learner effect | "For you" line | — | — | **Later** — study/12, needs data |
| Last done | Neglect visibility | — | — | **Later** — study/12 |
| Readiness | Better later / ready | — | — | **Later** — UC-057, separate from badges |
| Variants | Shorter, harder, … | — | — | **Later** — UC-042 out of scope v1 |
| Thumbs / popularity | Social proof | — | — | **Never** — herding (study/12) |

---

## Badge families — card vs detail

### Skill contribution

| Surface | Treatment | Why |
| --- | --- | --- |
| **Card** | Small Lucide marks (primary / secondary / slight) | Scannable at catalogue scale ([27](27-method-badges.md) §5) |
| **Detail** | Arts tier shields, bronze+ only, icons only | Owner direction ([33](33-skill-tier-badges-exploration.md)); room for one method |

**Do not** show tier names or global method rank. `aria-label` carries tier + skill.

### Evidence

| Surface | Treatment | Why |
| --- | --- | --- |
| **Card** | Plain text chip: "Thin evidence", "Solid evidence", … | Answers scan question 2 at a glance |
| **Detail badge band** | **None** | Crowding; duplicates Practical disclosure |
| **Detail Practical** | Collapsed disclosure: label + `evidenceProse` | Depth without card noise |

**Rejected:** letter grades ("Evidence C"), evidence badge in the detail band
(current drift — fix on go).

### Effort / intensity

| Surface | Treatment | Why |
| --- | --- | --- |
| **Card** | Plain text: "Light effort", "Needs focus", "Draining" | Matches energy filter; not a rating scale |
| **Detail badge band** | Same plain text badge, aligned right when tiers present | Mirrors [33](33-skill-tier-badges-exploration.md) layout **without** dots |
| **Detail Practical** | One sentence: `{label} — {INTENSITY anchor}` | UC-042 mechanism depth |

**Rejected: the three-dot effort scale.** Study/27 § Effort load: *"No dot scales
— they read as ratings without a legend."* The 2026-08-16 `EffortScale` on detail
is a regression. Energy filter already uses discrete steps; dots add a second
visual language for the same fact.

If the owner wants a **non-text** effort cue on detail only, use the **same words**
in a badge — not filled circles.

---

## Logistics chips (not badges)

### Duration

**One chip.** Range when ≥2 values (`15–25 min`), single when one, `Open-ended`
when null. Three chips read as three simultaneous requirements ([supplement](../specs/page/method-detail.supplement.md) § duration).

### Hosted

Always one chip: `App runs this` / `Off-app`. Matches tap expectation (session vs
info page).

### Requirements (`requires`)

**Problem today:** every dimension value becomes a chip — `eyes free`, `full
attention`, `both hands`, `alone`, … — often five or more on one card. The
screenshot shows duration + eyes + attention + hosted; **attention overlaps
intensity** (full attention ≈ needs focus / draining).

**Card rule (proposed):**

1. Always: duration + hosted (2 chips minimum).
2. Plus up to **two** **blocking** constraint chips from:
   - **sound** — when not performable with only a speaker (headphones or silent)
   - **hands** — when not performable hands-free (`free` or `one` required)
   - **voice** — when aloud required, or when voice must be silent (`none`)
   - **eyes** — when eyes must be on screen (`occupied` not allowed) or when
     eyes-busy is the headline affordance (`occupied` only)
   - **writingSurface** — when paper or keyboard required (not touch-only default)
3. **Never on card:** `attention`, `company` — filter/refine or effort covers these.

**Detail rule:** full flattened list in Practical **Needs** — the card is a
filter hint, detail is the checklist.

### `doesNotDo` on card

Keep **clamped two lines** below chips. Honesty at browse depth; detail callout
expands. Removing it from cards would hide the product's distinguishing rule
(study/12 info page § mandatory limits).

---

## Layout contracts (proposed)

### Method card

```
┌ section graphic (h-20) + SECTION LABEL ─────────────┐
│ Title                                               │
│ Summary (2 lines max)                               │
│ [skill marks]  Solid evidence  Draining             │  ← badge row (3 families)
│ [15–25 min] [eyes free] [App runs this]             │  ← logistics (≤4 chips)
│ What it does not do: … (2 lines)                    │
└─────────────────────────────────────────────────────┘
```

### Method detail

```
┌ full-bleed section hero (same asset as card) ─────────┐
│ <h1> full name                                        │
│ summary                                               │
│ [tier shields …]                    Draining          │  ← tiers left, effort text right
│                                                       │
│ [mobile: Practical disclosure]  │  [desktop: aside]  │
│   duration · needs (full) · hosted · effort sentence  │
│   ▸ How sure is the research?                         │
│                                                       │
│ trains prose (mechanism)                              │
│ What it does not do (callout)                         │
│ Start / not-built                                     │
└─────────────────────────────────────────────────────┘
```

**No evidence in the badge band.** No effort dots. No duplicate "Mainly: Listening
(primary)" when tier shields already show the same fact.

---

## Tensions resolved

| Tension | Resolution |
| --- | --- |
| study/27 "no badge row on detail" vs study/33 tier band | Detail band **only** for skill tiers + effort text — not a repeat of the full card row |
| Plain effort labels vs dot scale | Plain labels everywhere; dots **removed** |
| Evidence on card vs detail | Card label + detail disclosure; **not** detail band |
| Many requirement chips vs scanability | Card: max 2 blocking needs; detail: full list |
| Section label on card vs text-mask hero | Keep section on card; detail hero may drop uppercase label when graphic is tall (optional polish) |

---

## Open for owner at **go**

1. **Effort on detail band** — plain badge right (recommended) vs Practical only
   (sparser band). Recommendation: **both** band + Practical sentence (band =
   scan, Practical = anchor).
2. **Blocking-chip priority** — when >2 constraints qualify, prefer sound → hands →
   voice → eyes → writingSurface. Confirm or reorder.
3. **Tier assets** — placeholder SVGs until final art; cards stay Lucide until
   owner approves card-tier art ([33](33-skill-tier-badges-exploration.md)).
4. **Text-mask hero** — deferred; full-bleed hero shipped; revisit after property
   audit lands.

---

## Traceability

| Doc | Change |
| --- | --- |
| [`method-menu.md`](../specs/page/method-menu.md) | Card chip cap + blocking rules |
| [`method-detail.md`](../specs/page/method-detail.md) | Band contents, no dots, evidence placement |
| [`method-badge.md`](../specs/component/method-badge.md) | Effort representation unified |
| UC-042, UC-045, UC-046 | Success criteria aligned |
| [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) | **T-B10d** — align implementation to audit |
