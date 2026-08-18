# Method card

<!-- id: SPEC-component-method-card -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Compact tappable **catalogue card** for one method. Shell, header, badge row,
and chips. Visual polish: [`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** `MethodCard` on `/methods` and daily-three; `LandingPreviewMethodCard`
  reuses the same body typography.
- **Out:** filter controls; detail page layout.

Implementation: `features/method-menu/MethodCard.tsx`.

## Body typography

| Element | Class | Notes |
| --- | --- | --- |
| Method name (`h3`) | `text-3xl font-semibold leading-tight text-ink` | Primary identity on the card |
| Summary | `text-sm text-muted line-clamp-2` | unchanged |
| Badge row | See [`method-badge.md`](method-badge.md) | tier shields + effort dots |
| Property chips | [`chip.md`](chip.md) | `size="card"` — `text-sm`, `min-h-8`, uniform |

Header: [`method-card-header.md`](method-card-header.md).

## Acceptance criteria

- [ ] Given any method card, when it renders, then the method name uses
      `text-3xl` — primary identity at catalogue distance.
- [ ] Given any method card, when it renders, then the header graphic uses the
      card header rules in [`method-card-header.md`](method-card-header.md).

## Check

`npm test -- method-menu method-card-header method-badge`
