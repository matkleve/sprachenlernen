# 34 · Method surfaces — property audit (UX designer review)

<!-- id: DR-036 -->
<!-- type: design-review -->
<!-- status: active -->

**Status:** owner go 2026-08-16 — **T-B10d shipped**. Card chips show all requirements;
detail band: tiers + plain effort; evidence disclosure-only; full-bleed hero kept.

---

## Owner decisions (2026-08-16 go)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Effort on detail | Plain badge on band (right) **and** anchor sentence in Practical |
| 2 | Card requirement chips | **Display all** — no cap |
| 3 | Tier art | **No update** — Lucide on cards; placeholder tier SVGs on detail |
| 4 | Hero | **Full-bleed** — text-mask deferred |

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
| `requires` | Context dimensions | all requirement chips | full needs list | **Show all on card** (owner go) |
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
| **Card** | Small Lucide marks (primary / secondary / slight) | Scannable at catalogue scale ([27](../../study/STUDY-025-method-badges.md) §5) |
| **Detail** | Arts tier shields, bronze+ only, icons only | Owner direction ([33](DR-033-skill-tier-badges-exploration.md)); room for one method |

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
| **Detail badge band** | Same plain text badge, aligned right when tiers present | Mirrors [33](DR-033-skill-tier-badges-exploration.md) layout **without** dots |
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
when null. Three chips read as three simultaneous requirements ([supplement](../../specs/page/method-detail.supplement.md) § duration).

### Hosted

Always one chip: `App runs this` / `Off-app`. Matches tap expectation (session vs
info page).

### Requirements (`requires`)

**Owner go (2026-08-16): display all.** Every dimension value from the catalogue
appears as a chip on the card (duration + hosted + all `requires` labels). Detail
Practical lists the same set under **Needs**.

*UX note (not adopted):* capping at two "blocking" chips was proposed to reduce
noise when `attention` overlaps intensity — owner preferred completeness.

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
| Many requirement chips vs scanability | Owner chose **display all** on cards |
| Section label on card vs text-mask hero | Keep section on card; detail hero may drop uppercase label when graphic is tall (optional polish) |

---

## Resolved at go

1. ~~Effort on detail band~~ — plain badge right + Practical anchor (shipped).
2. ~~Card chips~~ — display all requirements (shipped).
3. ~~Tier assets~~ — no update until owner approves final art.
4. ~~Text-mask hero~~ — full-bleed retained.

---

## Open (unchanged)

- Replace placeholder tier SVGs with final art from approved grid.

---

## Traceability

| Doc | Change |
| --- | --- |
| [`method-menu.md`](../../specs/page/method-menu.md) | Card chip cap + blocking rules |
| [`method-detail.md`](../../specs/page/method-detail.md) | Band contents, no dots, evidence placement |
| [`method-badge.md`](../../specs/component/method-badge.md) | Effort representation unified |
| UC-042, UC-045, UC-046 | Success criteria aligned |
| [`IMPLEMENTATION-PLAN.md`](../../IMPLEMENTATION-PLAN.md) | **T-B10d** — align implementation to audit |
