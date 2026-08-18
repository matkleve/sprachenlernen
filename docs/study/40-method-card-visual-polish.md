# 40 · Method card visual polish — UX designer review

**Status:** shipped — owner GO 2026-08-18 (T-B10f).

Companion: [`method-card-header.md`](../specs/component/method-card-header.md),
[`skill-tier-badge.md`](../specs/component/skill-tier-badge.md),
[39](39-method-section-graphics-brief.md), [33](33-skill-tier-badges-exploration.md).

---

## What the owner reported

On catalogue cards (`/methods`):

1. **Section header image** looks **stretched** / wrong crop — headphones read
   squashed wide.
2. Header should **fade more** into the card body — current edge feels hard;
   contrast with the section label (`HÖREN`) must stay readable.
3. **Method title** (`h3`) is **too small** for the primary identity on the card.
4. **Skill-tier shields** in the badge row feel **too small**, **clipped** at
   the edges, and possibly squashed — wood listening shield barely readable.

---

## Diagnosis (code + assets)

### A · Section header (`MethodCardHeader`, card size)

| Finding | Cause |
| --- | --- |
| Motif feels stretched | Assets are **1600×500 (3.2∶1)** but the card slot is **~full width × 80px (`h-20`)** — on a 1-column mobile card that is **~4–5∶1**. `object-cover` **crops** sides, not stretches — but a **centre-weighted** wide motif (headphones) loses vertical context and reads as “squashed into a strip”. |
| Hard cut into body | Gradient is **two stops**: `from-surface/90 via-surface/20 to-transparent`. The `via` at 20% opacity leaves a visible **horizon line** before the title block. |
| Label contrast risk | Section label sits **on** the fade (`text-muted`, lower-left). A stronger fade without a **scrim pocket** for the label will drop contrast below WCAG on busy motifs. |

**Verdict:** Fix is **layout + gradient**, not only new art. If art is re-exported,
keep **wide** format but compose motif **higher** in frame so `object-cover` with
`object-position` centre-top preserves proportions.

### B · Card title (`MethodCard`)

| Finding | Cause |
| --- | --- |
| Title undersized | `text-base` (16px) — same scale as dense UI chrome; catalogue **name** should lead the body block. |

**Verdict:** Bump to **`text-lg`** (`font-semibold`) on cards; keep summary at
`text-sm`. Detail `<h1>` unchanged.

### C · Skill-tier shields on cards (`SkillTierBadge`, `size="card"`)

| Finding | Cause |
| --- | --- |
| Too small | Card size is **`size-7` (28×28px)** — detail uses **48px**. Heraldic shields need ~**1.5×** card scale to read at catalogue distance. |
| Clipped / cut off | Grid slice uses **tight crops** (`MARGIN_X/Y` 4–6%); shield **points and frame flourishes** sit near cell edges → PNG alpha eats tips. `object-contain` in a **square** box clips a **tall** shield silhouette. |
| Squashed appearance | Same square box — shield is **not** square; forcing fit reads as crushed. |

**Verdict:** **Code:** larger hit target, inner padding, non-square aspect optional
(`h-10 w-9`). **Assets:** re-export card lane with **10–15% transparent padding**
inside each cell before slice; or separate **@2x card** exports (64px nominal).

---

## UX recommendations (designer sign-off)

### 1 · Section header — card variant only

| # | Change | Rationale |
| --- | --- | --- |
| H1 | Increase card header height **`h-20` → `h-24`** (96px) | More vertical room; less aggressive crop |
| H2 | `object-cover` + **`object-[center_30%]`** (focal point upper-centre) | Headphones / motifs keep natural proportions |
| H3 | **Three-stop** fade: `from-surface` at bottom **100%** → **60%** at 40% → transparent top | Softer merge into card body; no hard line |
| H4 | **Label scrim:** 4px rounded pocket or `text-shadow` / `bg-surface/40` backdrop blur **only behind label** | Stronger fade without losing “HÖREN” contrast |
| H5 | Hero variant (`size="hero"`) **unchanged** in v1 — tune card first | Detail hero already uses taller band |

**Do not** use `object-fill` (that would truly stretch). **Do not** reduce
header height to fix width.

### 2 · Card title typography

| Element | Current | Proposed |
| --- | --- | --- |
| Method name (`h3`) | `text-base font-semibold` | **`text-lg font-semibold`** |
| Summary | `text-sm text-muted` | unchanged |
| Line clamp | `line-clamp-2` on summary | unchanged |

### 3 · Skill-tier shields — card row

| # | Change | Rationale |
| --- | --- | --- |
| S1 | Card badge **`size-10`** (40px) minimum; detail stays 48px | Readable wood/bronze at arm's length |
| S2 | Wrapper **`p-0.5`** or `scale-95` inside box — never flush to clip | Tips of shield not cropped by box |
| S3 | Prefer **`aspect-[4/5]`** container (portrait) over square | Matches shield silhouette |
| S4 | Re-slice grid with **larger inner margin** (12% per cell) or deliver **card** + **detail** PNG sets | Asset fix beats CSS upscale |
| S5 | `+` overflow chip **same height** as shields | Row alignment |

### 4 · Badge row rhythm

Keep order: **shields → Effort dots**. Increase **`gap-2`** between shield and
effort chip so the row breathes (currently `gap-1` in `SkillTierBadgeRow`).

---

## What to rework (designer deliverables)

### Section graphics (if re-export)

- [ ] Re-compose each of 8 banners with motif in **upper two-thirds**; bottom
      third left soft for fade (see [39](39-method-section-graphics-brief.md)).
- [ ] Squint test at **96px height** × **320px width** (narrow card mock).
- [ ] No change to file names or paths — replace WebP in place.

### Skill-tier shields (re-slice or v2 grid)

- [ ] Add **transparent padding** inside each grid cell before export (shield
      floats, no tip clipping).
- [ ] Optional: second export **`{skill}-{tier}-card.png`** at 80×80 with
      extra padding; detail keeps 96×96 or current PNG.
- [ ] Re-run `scripts/slice-skill-tier-badges.py` after margin tweak — document
      final `MARGIN_*` in script comment.

### No rework needed

- Effort dot control (reads fine at current size).
- Chip row, `doesNotDo` prose, section surface tint.

---

## Alternatives considered

| Idea | Why rejected |
| --- | --- |
| `object-contain` + letterbox for header | Empty bands left/right on wide cards — looks like a bug |
| Same 28px shields, sharper assets only | Still too small for catalogue scan; clipping is structural |
| Bigger header only, no gradient change | Fade complaint unresolved |
| Photographic full-bleed headers per method | Violates study/27 gestalt — 53 unique assets |

---

## Spec promotion checklist (shipped T-B10f)

- [x] Update [`method-card-header.md`](../specs/component/method-card-header.md)
- [x] Update [`skill-tier-badge.md`](../specs/component/skill-tier-badge.md)
- [x] Add [`method-card.md`](../specs/component/method-card.md)
- [x] Implement T-B10f; `npm test -- method-card-header method-badge skill-tier`
- [ ] Visual check DE + EN on `/methods` (1-col and 3-col) — LIVE CHECK (owner)

---

## Open questions for owner

1. **Header height:** `h-24` (96px) or **`h-28`** (112px)? Recommend **h-24**
   first — less scroll cost on daily-three stack.
2. **Card shields:** one PNG set with padding, or **card + detail** asset pairs?
3. **Title:** `text-lg` only, or **`text-lg` on sm+** and `text-base` on very
   narrow? Recommend **single step** `text-lg` everywhere for consistency.
