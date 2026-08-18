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
  `public/assets/method-sections/`; gradient overlay; uppercase section label;
  `alt` text naming the section as decorative. Client component (`"use client"`)
  — section labels use `useMethodMenuCopy`. Images use `unoptimized`.
- **Out:** per-method illustrations; interactive header; accent left border.
  Detail hero reuses `size="hero"` — see [`../page/method-detail.md`](../page/method-detail.md).

Implementation: `features/method-menu/MethodCardHeader.tsx`,
`features/method-menu/section-graphic.ts`.

Asset brief: [`../../study/39-method-section-graphics-brief.md`](../../study/39-method-section-graphics-brief.md).

## Card variant (`size="card"`)

| Property | Value |
| --- | --- |
| Height | `h-24` (96px) |
| Image fit | `object-cover object-[center_30%]` — never `object-fill` |
| Fade | Three stops: `from-surface` 0% → `via-surface/60` 40% → transparent |
| Label | Uppercase **`text-ink`**; **scrim pocket** `bg-surface/70` + light blur |

## Hero variant (`size="hero"`)

Taller band on method detail — `h-44 sm:h-52`, `object-center`, two-stop fade
into `canvas`. Unchanged from card polish (T-B10f).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Header shows the graphic for the method's `section` |
| 2 | Scans the catalogue | Same section → same graphic motif (gestalt grouping) |
| 3 | Screen reader inside card link | Badge `sr-only` summary carries facts; header `alt` is decorative |

## Acceptance criteria

- [ ] Given any method card, when it renders, then a header graphic appears
      above the title with full card width.
- [ ] Given card size, when the header renders, then height is **`h-24`**.
- [ ] Given card size, when the header renders, then the image uses
      **`object-cover`** with **`object-[center_30%]`** — never `object-fill`.
- [ ] Given card size, when the header renders, then a **multi-stop** fade
      merges into `surface` without a visible hard horizon.
- [ ] Given the section label, when the header renders, then contrast meets
      WCAG AA against the fade (scrim pocket behind label).
- [ ] Given a method in the listening section, when the card renders, then the
      listening section asset is shown.
- [ ] Given any header, when it renders, then only token utilities are used.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-card-header`
