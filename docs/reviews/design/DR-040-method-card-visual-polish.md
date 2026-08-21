# 40 · Method card visual polish — UX designer review

<!-- id: DR-040 -->
<!-- type: design-review -->
<!-- status: active -->

**Status:** **open — owner feedback 2026-08-18, confirmed still failing after
v0.25.3.** Code pass landed (T-B10f-a); **assets pass not done** (T-B10f-b).
Do not mark shipped until owner LIVE CHECK passes on `/methods`.

Companion: [`method-card-header.md`](../../specs/component/method-card-header.md),
[`skill-tier-badge.md`](../../specs/component/skill-tier-badge.md),
[`method-card.md`](../../specs/component/method-card.md),
[39/../../explorations/EXP-039-method-section-graphics-brief.md), [33](DR-033-skill-tier-badges-exploration.md).

---

## What the owner reported

On catalogue cards (`/methods`), screenshot: Background listening, DE:

1. **Section header image** looks **stretched** / wrong crop — headphones read
   squashed wide.
2. Header should **fade more** into the card body — edge still feels hard;
   contrast with the section label (`HÖREN`) must stay readable.
3. **Method title** (`h3`) is **too small** for the primary identity on the card.
4. **Skill-tier shields** feel **too small**, **clipped** at the edges (shield
   point and bottom corners cut off), barely readable at catalogue distance.

---

## What already landed in code (T-B10f-a) — not enough alone

| Change | File | Owner still sees problem? |
| --- | --- | --- |
| Header `h-20` → `h-24` | `MethodCardHeader.tsx` | **Yes** — crop still wrong; asset composition |
| `object-[center_30%]` | same | **Yes** — motif still reads flat/wide |
| Three-stop fade + label scrim | same | **Partial** — fade better; headphones still dominate |
| Title `text-base` → `text-lg` | `MethodCard.tsx` | **Check** — may be enough; owner wanted bigger |
| Shields `28px` → `40px` portrait | `SkillTierBadge.tsx` | **Yes** — still tiny and **cut** |
| Grid re-slice 12% margin | `slice-skill-tier-badges.py` | **No effect** — see asset audit below |

**Lesson:** CSS cannot fix shields whose **PNG alpha already eats the tips**.
Section banners need **re-composed art**, not only `object-position`.

---

## Asset audit (2026-08-18, `listening-wood.png`)

```
File size:     189 × 171 px
Content bbox:  (0, 8) → (189, 171)   ← touches left, right, bottom edges
Margins:       L 0 · R 0 · T 8 · B 0
```

The clip is **in the file**, not the React wrapper. `p-0.5` and `aspect-[4/5]`
cannot restore missing pixels.

---

## UX recommendations — designer sign-off required

### 1 · Section header (card variant)

| # | Change | Rationale |
| --- | --- | --- |
| H1 | Keep **`h-24`**; try **`h-28`** if squint test still fails | More vertical room before re-export |
| H2 | **`object-cover object-[center_30%]`** in code — keep | Never `object-fill` |
| H3 | **Softer fade:** bottom `surface` 100% → 70% at 50% → transparent | Owner wants more merge into body |
| H4 | **Label scrim** — keep `bg-surface/70` + `text-ink` | Contrast when fade deepens |
| **H5 · ART** | Re-export 8 WebPs: motif in **upper 60%**, bottom **40% soft/empty** | Fixes “stretched strip” at source — [39/../../explorations/EXP-039-method-section-graphics-brief.md) |
| H6 | Squint test: **96×320px** and **96×400px** mock before handoff | Matches 1-col and 3-col card widths |

**Designer deliverable:** replace files in `public/assets/method-sections/` in place
(same names). No per-method assets.

### 2 · Card title

| Element | Shipped | Designer / owner |
| --- | --- | --- |
| Method name (`h3`) | `text-lg font-semibold` | If still small: **`text-xl`** on `sm+` only — owner decides |
| Summary | `text-sm text-muted` | unchanged |

### 3 · Skill-tier shields — **blocked on new art**

| # | Change | Rationale |
| --- | --- | --- |
| S1 | **Card size 48px** (`size-12`) — same as detail, not 40px | Owner: still too small at arm's length |
| S2 | **Separate card PNG set** `{skill}-{tier}-card.png` at **96×96 canvas**, shield **≤70%** of cell | Tips never touch bbox; detail keeps current PNGs |
| S3 | Or: re-export **source grid** with shield **scaled to 65%** centred in each cell | Then re-run slice script with `MARGIN_X/Y ≥ 0.18` |
| S4 | Wrapper: `object-contain`, **no** square crop; min `h-12 w-10` portrait | Code change after assets land |
| S5 | Acceptance: **full heraldic silhouette** — point, ears, frame visible | Fails today — see screenshot |

**Designer deliverable (pick one):**

- [ ] **Option A:** New grid `design/skill-tier-badges/source-grid-v2.png` + slice
- [ ] **Option B:** 20 files `*-card.png` (4 skills × 5 tiers) with generous padding

Runbook: `scripts/slice-skill-tier-badges.py` — document final margins in script.

### 4 · Unchanged

Effort dots, chip row, `doesNotDo` prose, section surface tint.

---

## Alternatives considered

| Idea | Why rejected |
| --- | --- |
| Bigger CSS box only | Tips already missing from PNG |
| `object-fill` on header | True stretch — worse |
| `object-contain` + letterbox on header | Empty side bands look broken |
| Ship T-B10f as done | Owner screenshot proves shields still clipped |

---

## Implementation phases

| Phase | Owner | Work |
| --- | --- | --- |
| **T-B10f-a** | Done in code | Header layout, title, badge wrapper — **insufficient without art** |
| **T-B10f-b** | **Blocked** | Section WebP re-export + shield card PNGs |
| **T-B10f-c** | After b | Wire `*-card.png` in `skill-tier-badges.ts`; bump card size to 48px; LIVE CHECK |

---

## Spec checklist (designer handoff)

- [x] [`method-card-header.md`](../../specs/component/method-card-header.md) — code rules + art dependency noted
- [x] [`skill-tier-badge.md`](../../specs/component/skill-tier-badge.md) — card AC **failing** until new assets
- [x] [`method-card.md`](../../specs/component/method-card.md) — title scale
- [ ] Designer assets delivered
- [ ] T-B10f-b implemented; owner LIVE CHECK DE + EN, 1-col + 3-col

---

## Open questions for owner

1. Header: stay **`h-24`** or try **`h-28`** with new art?
2. Shields: **Option A** (new grid) or **Option B** (card-only PNGs)?
3. Title: keep **`text-lg`** or bump to **`text-xl`** on `sm+`?
