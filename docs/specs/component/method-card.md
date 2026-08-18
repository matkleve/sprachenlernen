# Method card

<!-- id: SPEC-component-method-card -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Compact tappable **catalogue card** for one method. Shell, header (with
destination marker), badge row, and chips. Visual polish:
[`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** `MethodCard` on `/methods` and daily-three; `LandingPreviewMethodCard`
  reuses summary typography; **destination marker** on card header.
- **Out:** filter controls; detail page layout; hosted/off-app chip on cards.

Implementation: `features/method-menu/MethodCard.tsx`,
`lib/method-session.ts` (`cardDestinationMarker`, `isRunnableFromMenu`).

## Body typography

| Element | Class | Notes |
| --- | --- | --- |
| Method name (`h3`) | `text-3xl font-semibold leading-tight text-ink` | Primary identity on the card |
| Summary | `text-sm text-ink line-clamp-2` | Session hook — `mt-0.5` below title |
| Body padding | `p-3` | Tighter than detail surfaces |
| Section gaps | `mt-2` between badge row, chips, does-not-do | Catalogue scan density |
| Badge row | See [`method-badge.md`](method-badge.md) | `layout="row"` — shields left, effort right |
| Property chips | [`chip.md`](chip.md) | `size="card"`; duration + requirements only |

Header + destination marker: [`method-card-header.md`](method-card-header.md).

## Destination marker

Two values, derived from `cardHrefForMethod` — not from `hosted` alone:

| Marker | When | Tap target |
| --- | --- | --- |
| **Start** | `isRunnableFromMenu` | Session route |
| **Info** | else (off-app or hosted-not-built) | Detail route |

Placement: top-right of card header — quiet text only (`text-muted` for Info,
`font-medium text-ink` for Start). Not a button.

## Acceptance criteria

- [ ] Given any method card, when it renders, then the method name uses
      `text-3xl` — primary identity at catalogue distance.
- [ ] Given any method card, when it renders, then the header graphic uses the
      card header rules in [`method-card-header.md`](method-card-header.md).
- [ ] Given a runnable method, when the card renders, then the header shows
      **Start** and the link `href` is a session route.
- [ ] Given a non-runnable method, when the card renders, then the header shows
      **Info** and the link `href` is the detail route.
- [ ] Given any method card, when it renders, then `summary` uses `text-ink` and
      no hosted/off-app chip appears in the property row.

## Check

`npm test -- method-menu method-card-header method-badge method-session`
