# Method card header

<!-- id: SPEC-component-method-card-header -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Decorative **section graphic** at the top of every method card — one abstract
image per catalogue section, with a gradient fade into the card body and a
section label. Gives visual identity at catalogue scale without per-method
assets. Contract: [`../../study/27-method-badges.md`](../../study/27-method-badges.md)
(card layout).

## Scope

- **In:** `MethodCardHeader` on `MethodCard`; eight webp assets in
  `public/assets/method-sections/`; gradient overlay; uppercase section label;
  `alt` text naming the section as decorative; fixed height (`h-20`).
- **Out:** per-method illustrations; interactive header; header on method detail
  (detail uses section prose label only); accent left border on cards.

Implementation: `features/method-menu/MethodCardHeader.tsx`,
`features/method-menu/section-graphic.ts`. Card shell uses
`methodSectionSurface` — uniform `rounded-card` border, soft section background,
`overflow-hidden` so the graphic respects corner radius.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Header shows the graphic for the method's `section` |
| 2 | Scans the catalogue | Same section → same graphic motif (gestalt grouping) |
| 3 | Uses a screen reader inside the card link | Badge row carries facts via `sr-only` summary; header image has decorative `alt` |

## States

Non-interactive — one visual state. No hover/focus requirement on the header
itself (the enclosing `SurfaceLink` owns focus-visible).

## Data

| Prop | Source |
| --- | --- |
| `section` | `MethodEntry.section` |

Section label text from `features/method-menu/content.ts` (`sections` map).
Asset path from `sectionGraphicSrc[section]`.

## Acceptance criteria

- [ ] Given any method card, when it renders, then a header graphic appears
      above the title with height `h-20` and full card width.
- [ ] Given a method in the listening section, when the card renders, then the
      listening section asset is shown — not a per-method image.
- [ ] Given any card, when it renders, then the card has a uniform border and
      no left accent stripe.
- [ ] Given any card, when it renders, then the section label appears on the
      header overlay in uppercase.
- [ ] Given the header image, when a screen reader encounters it, then `alt`
      identifies the section and states it is decorative.
- [ ] Given any header, when it renders, then only token utilities are used —
      no raw colors or radii.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-menu`
