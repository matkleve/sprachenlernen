# Method detail — UX exploration supplement

<!-- status: superseded — merged into method-detail.md 2026-08-16 -->
<!-- parent: docs/specs/page/method-detail.md -->
<!-- study: docs/study/33-skill-tier-badges-exploration.md -->

Proposed changes from the 2026-08-16 methods detail redesign discussion.
**Nothing here is normative** until merged into `method-detail.md` and accepted
by the owner.

---

## Owner decisions (2026-08-16)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Hero style | **Text-mask first** — section graphic integrated with in-page title; full-bleed fade hero deferred |
| 2 | Duration chips | **Deferred** — UX recommendation below; owner asked for designer input |
| 3 | Skill marks on detail | **Tier badges** (wood→platinum metric; show bronze+ only; icons only) — see study/33 |
| 4 | Layout | Skill tier badges **left**, effort **right**, under in-page title (not shell header) |
| 5 | Which skills shown | **Only improving** — bronze tier or higher; wood hidden |
| 6 | Badge labels | **Icons only** — no visible tier/skill text; `aria-label` for a11y |

---

## Proposed layout (detail page)

```
┌─────────────────────────────────────────────────────────┐
│  [Text-mask hero: section graphic + method name]        │
│  Summary (muted, full width)                            │
│                                                         │
│  [🎧] [📖]                              Draining →  │  ← tier icons only (bronze+)
│                                                         │
│  Practical                                              │
│  … effort sentence …                                    │
│  Fact chips: duration · needs · hosted                  │
│                                                         │
│  Trains                                                 │
│  Mechanism prose (catalogue `trains` — not "listening") │
│                                                         │
│  What it does not do (callout)                          │
│  ▸ Research confidence                                  │
└─────────────────────────────────────────────────────────┘
```

Shell header (`ShellPageTitle`): truncated method name — unchanged contract.

### Responsive

| Viewport | Badge band |
| --- | --- |
| `≥ sm` | Skill badges `justify-start`, effort `ml-auto` on same row |
| `< sm` | Skill badges full width, effort on second row left-aligned |

---

## Text-mask hero (v1)

**In scope when promoted**

- Reuse `sectionGraphicSrc[section]` from `features/method-menu/section-graphic.ts`.
- Hero band height ~`h-48`–`h-56` on detail (taller than card `h-20`).
- Method `name` as in-page `<h1>` with one of:
  - **A.** `background-clip: text` fill from section image (preferred try)
  - **B.** White/scrim text on bottom third of image when name is long or contrast fails
- Section uppercase label **removed** when hero carries section identity.
- Gradient fade at bottom into `bg-canvas` / page surface.

**Out of v1:** full-bleed image breaking out of `max-w-2xl` (v2).

**Dependency:** `public/assets/method-sections/*.webp` must exist (currently missing
from repo).

**Acceptance criteria (draft)**

- [ ] Given a method with a long name, when detail renders, then the full name is
      readable (mask or scrim fallback).
- [ ] Given any method, when detail renders, then the hero uses the method's
      `section` graphic, not a per-method asset.
- [ ] Given the hero, when a screen reader reads the page, then one `<h1>` carries
      the method name (resolve dual-h1 with shell — see below).

### Dual `<h1>` resolution (draft)

Option A (preferred): shell title on drill-in routes becomes `<p role="doc-subtitle">`
or visually hidden duplicate; in-page hero owns the single `<h1>`.

Option B: shell keeps `<h1>` truncated; hero uses `<h2 className="sr-only">` for
full name — worse for sighted users.

---

## Skill tier badge band (draft)

See [study/33](../../study/33-skill-tier-badges-exploration.md) for tier semantics
and the v3 asset brief (repo only — not for chat paste).

**In scope when promoted**

- New component: `SkillTierBadge` (detail first; cards later optional).
- Registry: `features/method-menu/skill-tier-badges.ts` — maps `(skill, tier)` →
  `{ assetSrc, ariaLabel }` (20 assets: 4 skills × 5 tiers; wood assets exist for
  metric completeness but are never rendered).
- Metric: `skillTierForMethod(method)` → per-skill tier (wood–platinum); see
  study/33 § Skill tier metric.
- **Display filter:** render badge only when `tier ≥ bronze`.
- **No visible text** on badges — shield icon only; `aria-label` e.g. “Gold
  listening contribution”.
- Data v2: optional `skillContribution` override on catalogue entry.

**Out of scope**

- Global method rank badge
- Wood tier on any visible surface (metric only)
- Learner unlock / progression tied to tiers
- Evidence grade in the badge band (stays in disclosure)

**Placement:** immediately after summary, before Practical section.

---

## Fact chips (logistics row)

Unchanged intent from prior exploration — consolidate duration, requirements,
hosted into icon+label chips (`h-8`, button-sm height). Lives in **Practical**,
not the tier badge band.

---

## UX recommendation: duration format (question 2)

*Written as UX designer input for the owner.*

**Problem:** Three chips (`10 min`, `20 min`, `45 min`) read as three simultaneous
requirements. Catalogue data means **pick one session length**.

**Recommendation: single chip on card and detail.**

| Surface | Display | Example |
| --- | --- | --- |
| Card | Range when ≥2 values | `⏱ 10–45 min` |
| Card | Single when one value | `⏱ 20 min` |
| Card | Open-ended | `⏱ Open-ended` |
| Detail (optional) | Expand in Practical copy | "Typical session: 10, 20, or 45 minutes" |

**Not recommended:** three separate chips (current), or min-only without max
(`from 10 min` — ambiguous).

**Implementation:** replace `durationChips()` array output with
`formatDurationFact(method.durations)` returning one `{ icon: Clock, label }`.

---

## UX recommendation: "Trains" duplication

Remove redundant "Mainly: Listening (primary)" prose when tier badges show the
same fact. Fix catalogue stubs where `trains` is literally `"listening"`.

---

## Spec diff checklist (when promoting)

Merge into `method-detail.md`:

- [ ] Layout order: hero → summary → **badge band** → Practical → Trains → …
- [ ] Hero: text-mask variant documented
- [ ] Badge band: skill tiers left, effort right
- [ ] Remove "no badge row on detail" (study/27 detail layout superseded for tiers)
- [ ] Single duration fact chip in Practical
- [ ] Dual-h1 resolution chosen

New component spec: `docs/specs/component/skill-tier-badge.md` (when assets exist).

Update `method-badge.md`: clarify cards keep Lucide marks until tier assets ship.

---

## Check

No automated check until promoted to active spec.
