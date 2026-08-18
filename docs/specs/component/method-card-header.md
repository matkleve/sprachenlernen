# Method card header

<!-- id: SPEC-component-method-card-header -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Decorative **section graphic** at the top of every method card — one abstract
image per catalogue section, with a gradient fade into the card body and a
section label. Gives visual identity at catalogue scale without per-method
assets. Contract: [`../../study/27-method-badges.md`](../../study/27-method-badges.md)
(card layout). Polish rationale: [`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** `MethodCardHeader` on `MethodCard`; eight webp assets in
  `public/assets/method-sections/`; gradient overlay; section label (bottom-left);
  **destination marker** (top-right) on card variant; `alt` text naming the
  section as decorative. Client component (`"use client"`) — labels and marker
  use `useMethodMenuCopy`. Images use `unoptimized`.
- **Out:** per-method illustrations; interactive header; accent left border;
  destination marker on detail hero (`size="hero"`).
  Detail hero reuses `size="hero"` — see [`../page/method-detail.md`](../page/method-detail.md).

Implementation: `features/method-menu/MethodCardHeader.tsx`,
`features/method-menu/section-graphic.ts`.

Asset brief: [`../../study/39-method-section-graphics-brief.md`](../../study/39-method-section-graphics-brief.md).

**Art dependency (T-B10f-b):** code layout shipped; owner still reports wrong crop
on listening headphones — **re-export section WebPs** per study/40 H5–H6 before
closing this spec.

## Card variant (`size="card"`)

| Property | Value |
| --- | --- |
| Height | `h-24` (96px) |
| Image fit | **`object-cover object-top`** on card — crop, never stretch |
| Fade | Three stops into **section soft** tint — matches card body |
| Section label | Bottom-left; uppercase **`text-ink`**; scrim pocket |
| Destination marker | Top-right; **secondary button shape** (`border`, `rounded-pill`, `shadow-soft`) — **not** a chip scrim; not a nested control |

## Hero variant (`size="hero"`)

Taller band on method detail — `h-44 sm:h-52`, `object-center`, two-stop fade
into `canvas`. Unchanged from card polish (T-B10f).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Header shows section graphic, label, and destination marker |
| 2 | Scans the catalogue | Same section → same graphic motif (gestalt grouping) |
| 3 | Screen reader inside card link | Badge `sr-only` summary carries facts; header `alt` is decorative |

## Acceptance criteria

- [ ] Given any method card, when it renders, then a header graphic appears
      above the title with full card width.
- [ ] Given card size, when the header renders, then height is **`h-24`**.
- [ ] Given card size, when the header renders, then the image uses
      **`object-cover object-top`** — cropped, never stretched.
- [ ] Given card size, when the header renders, then a **multi-stop** fade
      merges into the **section soft** background without a visible hard horizon.
- [ ] Given the section label, when the header renders, then contrast meets
      WCAG AA against the fade (scrim pocket behind label).
- [ ] Given a method in the listening section, when the card renders, then the
      listening section asset is shown.
- [ ] Given any header, when it renders, then only token utilities are used.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-card-header`
